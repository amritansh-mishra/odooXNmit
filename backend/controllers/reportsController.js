const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/CustomerInvoice');
const VendorBill = require('../models/VendorBills');
const StockLedger = require('../models/StockLedger');
const CoA = require('../models/CoA');
const { Op } = require('sequelize');

// Helper: parse date range from query: support ?date=YYYY-MM-DD OR ?month=1-12&year=YYYY OR ?from=&to=
function parseDateRange(query) {
  let from = query.from ? new Date(query.from) : null;
  let to = query.to ? new Date(query.to) : null;
  if (query.date) {
    const d = new Date(query.date);
    if (!isNaN(d)) {
      from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
      to = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
    }
  } else if (query.month || query.year) {
    const y = query.year ? parseInt(query.year, 10) : new Date().getFullYear();
    const m = (query.month ? parseInt(query.month, 10) : 1) - 1; // 0-based
    from = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
    to = new Date(end.getTime() - 1);
  }
  return { from, to };
}

// Returns on-hand stock per product and overall summary
exports.getStockReport = async (req, res, next) => {
  try {
    const rows = await StockLedger.findAll({ raw: true });

    // Aggregate quantities by product_id
    const byProduct = new Map();
    for (const r of rows) {
      const pid = r.product_id;
      if (!byProduct.has(pid)) byProduct.set(pid, { inQty: 0, outQty: 0 });
      const agg = byProduct.get(pid);
      if (r.type === 'In') agg.inQty += Number(r.quantity) || 0;
      else if (r.type === 'Out') agg.outQty += Number(r.quantity) || 0;
    }

    const productIds = Array.from(byProduct.keys());
    const products = await Product.findAll({ where: { id: productIds }, raw: true });
    const prodMap = new Map(products.map(p => [p.id, p]));

    const data = productIds.map(pid => {
      const agg = byProduct.get(pid);
      const onHand = (agg.inQty || 0) - (agg.outQty || 0);
      const p = prodMap.get(pid) || {};
      const purchasePrice = Number(p.purchase_price) || 0;
      return {
        productId: pid,
        productName: p.name || `#${pid}`,
        onHand,
        purchasePrice,
        stockValue: onHand * purchasePrice,
      };
    }).sort((a, b) => a.productName.localeCompare(b.productName));

    const summary = data.reduce((acc, r) => {
      acc.totalQty += r.onHand;
      acc.totalValue += r.stockValue;
      return acc;
    }, { totalQty: 0, totalValue: 0 });

    res.json({ success: true, data, summary });
  } catch (err) { next(err); }
};

// Returns Profit & Loss with Income and Expense grouped by CoA accounts and optional date filters
exports.getProfitAndLoss = async (req, res, next) => {
  try {
    const { from, to } = parseDateRange(req.query);

    // Fetch confirmed invoices and vendor bills in range
    const invWhere = { status: 'confirmed' };
    const billWhere = { status: 'confirmed' };
    if (from || to) {
      invWhere.invoice_date = {};
      billWhere.invoice_date = {};
      if (from) { invWhere.invoice_date[Op.gte] = from; billWhere.invoice_date[Op.gte] = from; }
      if (to) { invWhere.invoice_date[Op.lte] = to; billWhere.invoice_date[Op.lte] = to; }
    }

    const [invoices, bills] = await Promise.all([
      Invoice.findAll({ where: invWhere, raw: true }),
      VendorBill.findAll({ where: billWhere, raw: true }),
    ]);

    // Collect unique account ids referenced in items
    const incomeLineItems = [];
    const expenseLineItems = [];

    for (const inv of invoices) {
      const items = Array.isArray(inv.items) ? inv.items : [];
      for (const it of items) {
        if (it.account) incomeLineItems.push({ account: it.account, amount: Number(it.lineTotal ?? ((Number(it.unitPrice)||0)*(Number(it.quantity)||0)*(1+(Number(it.taxRate)||0)/100))) });
      }
    }
    for (const vb of bills) {
      const items = Array.isArray(vb.items) ? vb.items : [];
      for (const it of items) {
        if (it.account) expenseLineItems.push({ account: it.account, amount: Number(it.lineTotal ?? ((Number(it.unitPrice)||0)*(Number(it.quantity)||0)*(1+(Number(it.taxRate)||0)/100))) });
      }
    }

    const accIds = Array.from(new Set([...incomeLineItems, ...expenseLineItems].map(x => x.account))).filter(Boolean);
    const accounts = await CoA.findAll({ where: { id: accIds, is_active: true }, raw: true });
    const accMap = new Map(accounts.map(a => [String(a.id), a]));

    // Group sums by accountName for Income and Expense
    const incomeMap = new Map();
    for (const row of incomeLineItems) {
      const acc = accMap.get(String(row.account));
      if (!acc || acc.type !== 'Income') continue;
      const key = acc.account_name;
      incomeMap.set(key, (incomeMap.get(key) || 0) + row.amount);
    }
    const expenseMap = new Map();
    for (const row of expenseLineItems) {
      const acc = accMap.get(String(row.account));
      if (!acc || acc.type !== 'Expense') continue;
      const key = acc.account_name;
      expenseMap.set(key, (expenseMap.get(key) || 0) + row.amount);
    }

    const incomeRows = Array.from(incomeMap.entries()).map(([accountName, amount]) => ({ accountName, amount })).sort((a,b)=>a.accountName.localeCompare(b.accountName));
    const expenseRows = Array.from(expenseMap.entries()).map(([accountName, amount]) => ({ accountName, amount })).sort((a,b)=>a.accountName.localeCompare(b.accountName));

    const incomeTotal = incomeRows.reduce((s, r) => s + (r.amount || 0), 0);
    const expenseTotal = expenseRows.reduce((s, r) => s + (r.amount || 0), 0);
    const netProfit = incomeTotal - expenseTotal;

    res.json({
      success: true,
      data: {
        expenses: expenseRows,
        incomes: incomeRows,
        totals: { expenseTotal, incomeTotal, netProfit },
        period: { from, to },
      },
    });
  } catch (err) { next(err); }
};

// Returns a balance sheet aligned to UI: Liabilities (Net Profit, Creditors A/c) vs Assets (Bank A/c, Cash A/c, Debtors A/c)
exports.getBalanceSheet = async (req, res, next) => {
  try {
    const { from, to } = parseDateRange(req.query);

    const invWhere = { status: 'confirmed' };
    const billWhere = { status: 'confirmed' };
    if (from || to) {
      invWhere.invoice_date = {};
      billWhere.invoice_date = {};
      if (from) { invWhere.invoice_date[Op.gte] = from; billWhere.invoice_date[Op.gte] = from; }
      if (to) { invWhere.invoice_date[Op.lte] = to; billWhere.invoice_date[Op.lte] = to; }
    }

    const [invoices, bills] = await Promise.all([
      Invoice.findAll({ where: invWhere, raw: true }),
      VendorBill.findAll({ where: billWhere, raw: true }),
    ]);

    // Cash/Bank balances (approx): receipts minus payments via invoices/bills
    const bank = (invoices.reduce((s,i)=> s + Number(i.paid_bank||0), 0)) - (bills.reduce((s,b)=> s + Number(b.paid_bank||0), 0));
    const cash = (invoices.reduce((s,i)=> s + Number(i.paid_cash||0), 0)) - (bills.reduce((s,b)=> s + Number(b.paid_cash||0), 0));

    // Debtors: outstanding from confirmed invoices
    const debtors = invoices.reduce((s,i)=> s + Number(i.amount_due||0), 0);
    // Creditors: outstanding from confirmed vendor bills
    const creditors = bills.reduce((s,b)=> s + Number(b.amount_due||0), 0);

    // Net profit: recompute quickly from invoices/bills line totals
    // Use P&L helper logic
    const incomeTotal = invoices.reduce((s,i)=> s + Number(i.total_amount||0), 0);
    const expenseTotal = bills.reduce((s,b)=> s + Number(b.total_amount||0), 0);
    const netProfit = incomeTotal - expenseTotal;

    const assetsTotal = bank + cash + debtors;
    const liabilitiesTotal = creditors + netProfit;

    res.json({
      success: true,
      data: {
        liabilities: { netProfit, creditors, total: liabilitiesTotal },
        assets: { bank, cash, debtors, total: assetsTotal },
        period: { from, to },
      },
      equation: 'Assets == Liabilities',
      check: Math.round((assetsTotal - liabilitiesTotal) * 100) / 100,
    });
  } catch (err) { next(err); }
};
