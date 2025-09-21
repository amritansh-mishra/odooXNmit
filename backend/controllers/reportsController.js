const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/CustomerInvoice');
const VendorBill = require('../models/VendorBills');
const StockLedger = require('../models/StockLedger');
const CoA = require('../models/CoA');
const Contact = require('../models/Customer');
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

// Dashboard summary: quick stats, monthly chart, recent transactions, and totals
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const { Op } = require('sequelize');
    const period = req.query.period || '30d';

    const now = new Date();
    let from = null;
    if (period === '7d') from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === '30d') from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === '90d') from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    else if (period === '1y') from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const invWhere = { status: 'confirmed' };
    const billWhere = { status: 'confirmed' };
    if (from) {
      invWhere.invoice_date = { [Op.gte]: from };
      billWhere.invoice_date = { [Op.gte]: from };
    }

    const [invoices, bills, activeCustomers] = await Promise.all([
      Invoice.findAll({ where: invWhere, raw: true }),
      VendorBill.findAll({ where: billWhere, raw: true }),
      Contact.count({ where: { is_active: true, type: { [Op.in]: ['Customer', 'Both'] } } }),
    ]);

    const sum = (arr, key) => arr.reduce((s, x) => s + Number(x[key] || 0), 0);

    const revenue = sum(invoices, 'total_amount');
    const purchases = sum(bills, 'total_amount');
    const paidIn = sum(invoices, 'paid_cash') + sum(invoices, 'paid_bank');
    const paidOut = sum(bills, 'paid_cash') + sum(bills, 'paid_bank');

    // Compute previous period for growth rate (revenue)
    let prevFrom = null;
    if (from) {
      const diffMs = now.getTime() - from.getTime();
      prevFrom = new Date(from.getTime() - diffMs);
    }

    let growthRate = 0;
    if (prevFrom) {
      const prevInvWhere = { status: 'confirmed', invoice_date: { [Op.gte]: prevFrom, [Op.lt]: from } };
      const prevInvoices = await Invoice.findAll({ where: prevInvWhere, raw: true });
      const prevRevenue = sum(prevInvoices, 'total_amount');
      if (prevRevenue > 0) growthRate = ((revenue - prevRevenue) / prevRevenue) * 100;
      else if (revenue > 0) growthRate = 100;
    }

    // Helper to compute bucket sums and changes
    const inRange = (d, start, end) => d >= start && d < end;
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayMs = 24 * 60 * 60 * 1000;

    const nowStart = startOfDay(now);
    const prevDayStart = new Date(nowStart.getTime() - dayMs);
    const prev2DayStart = new Date(prevDayStart.getTime() - dayMs);

    const weekStart = new Date(nowStart.getTime() - 7 * dayMs);
    const prevWeekStart = new Date(weekStart.getTime() - 7 * dayMs);

    const monthStart = new Date(nowStart.getTime() - 30 * dayMs);

    const bucketSums = (rows, amountKey) => {
      const getDate = (r) => new Date(r.invoice_date);

      const last24Hours = rows
        .filter(r => inRange(getDate(r), nowStart, new Date(nowStart.getTime() + dayMs)))
        .reduce((s, r) => s + Number(r[amountKey] || 0), 0);

      const prev24Hours = rows
        .filter(r => inRange(getDate(r), prevDayStart, nowStart))
        .reduce((s, r) => s + Number(r[amountKey] || 0), 0);

      const last7Days = rows
        .filter(r => inRange(getDate(r), weekStart, nowStart))
        .reduce((s, r) => s + Number(r[amountKey] || 0), 0);

      const prev7Days = rows
        .filter(r => inRange(getDate(r), prevWeekStart, weekStart))
        .reduce((s, r) => s + Number(r[amountKey] || 0), 0);

      const last30Days = rows
        .filter(r => inRange(getDate(r), monthStart, nowStart))
        .reduce((s, r) => s + Number(r[amountKey] || 0), 0);

      const change24h = prev24Hours === 0 ? (last24Hours > 0 ? 100 : 0) : ((last24Hours - prev24Hours) / prev24Hours) * 100;
      const change7d = prev7Days === 0 ? (last7Days > 0 ? 100 : 0) : ((last7Days - prev7Days) / prev7Days) * 100;

      return { last24Hours, last7Days, last30Days, change24h, change7d };
    };

    const totalInvoice = bucketSums(invoices, 'total_amount');
    const totalPurchase = bucketSums(bills, 'total_amount');

    // Payments: compute paidIn (invoices) and paidOut (bills) by buckets, then net
    const paidInBuckets = bucketSums(
      invoices.map(r => ({ ...r, paid_total: Number(r.paid_cash || 0) + Number(r.paid_bank || 0) })),
      'paid_total'
    );
    const paidOutBuckets = bucketSums(
      bills.map(r => ({ ...r, paid_total: Number(r.paid_cash || 0) + Number(r.paid_bank || 0) })),
      'paid_total'
    );

    const totalPayment = {
      last24Hours: Math.max(paidInBuckets.last24Hours - paidOutBuckets.last24Hours, 0),
      last7Days: Math.max(paidInBuckets.last7Days - paidOutBuckets.last7Days, 0),
      last30Days: Math.max(paidInBuckets.last30Days - paidOutBuckets.last30Days, 0),
      change24h: paidInBuckets.change24h - paidOutBuckets.change24h,
      change7d: paidInBuckets.change7d - paidOutBuckets.change7d,
    };

    // Monthly chart data (last 12 months)
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth() + 1}`, label: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`, sales: 0, purchases: 0 });
    }

    const monthKey = (d) => `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
    const monthMap = new Map(months.map(m => [m.key, m]));

    for (const inv of invoices) {
      const d = new Date(inv.invoice_date);
      const key = monthKey(d);
      if (monthMap.has(key)) monthMap.get(key).sales += Number(inv.total_amount || 0);
    }
    for (const vb of bills) {
      const d = new Date(vb.invoice_date);
      const key = monthKey(d);
      if (monthMap.has(key)) monthMap.get(key).purchases += Number(vb.total_amount || 0);
    }

    const chartData = months.map(m => ({ month: m.label, sales: Math.round(m.sales), purchases: Math.round(m.purchases) }));

    // Recent transactions
    const [recentInvs, recentBills] = await Promise.all([
      Invoice.findAll({ where: { status: 'confirmed' }, order: [['invoice_date', 'DESC']], limit: 10, raw: true }),
      VendorBill.findAll({ where: { status: 'confirmed' }, order: [['invoice_date', 'DESC']], limit: 10, raw: true }),
    ]);

    const customerIds = Array.from(new Set(recentInvs.map(x => x.customer_id).filter(Boolean)));
    const vendorIds = Array.from(new Set(recentBills.map(x => x.vendor_id).filter(Boolean)));

    const [customers, vendors] = await Promise.all([
      Contact.findAll({ where: { id: customerIds }, raw: true }),
      Contact.findAll({ where: { id: vendorIds }, raw: true }),
    ]);
    const custMap = new Map(customers.map(c => [c.id, c]));
    const vendMap = new Map(vendors.map(v => [v.id, v]));

    const recentTransactions = [
      ...recentInvs.map(i => ({
        id: `INV-${i.id}`,
        type: 'income',
        description: `Invoice #${i.invoice_number || i.id}`,
        date: new Date(i.invoice_date).toISOString(),
        category: custMap.get(i.customer_id)?.name || 'Customer',
        amount: Number(i.total_amount || 0),
        status: i.payment_status === 'Paid' ? 'completed' : 'pending',
        method: i.payment_mode || 'Bank',
        reference: i.reference || '',
        balance: Number(i.amount_due || 0),
      })),
      ...recentBills.map(b => ({
        id: `BILL-${b.id}`,
        type: 'expense',
        description: `Vendor Bill #${b.bill_number || b.id}`,
        date: new Date(b.invoice_date).toISOString(),
        category: vendMap.get(b.vendor_id)?.name || 'Vendor',
        amount: Number(b.total_amount || 0),
        status: Number(b.amount_due || 0) === 0 ? 'completed' : 'pending',
        method: b.payment_mode || 'Bank',
        reference: b.reference || '',
        balance: Number(b.amount_due || 0),
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(t => ({ ...t, date: new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }));

    const data = {
      quickStats: {
        totalRevenue: revenue,
        activeClients: activeCustomers,
        growthRate: growthRate,
      },
      timeBasedStats: {
        totalInvoice,
        totalPurchase,
        totalPayment,
      },
      chartData,
      recentTransactions,
    };

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
