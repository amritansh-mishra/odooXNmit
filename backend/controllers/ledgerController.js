const Contact = require('../models/Customer');
const VendorBill = require('../models/VendorBills');
const Invoice = require('../models/CustomerInvoice');

function parseDateFilter(query) {
  let from = query.from ? new Date(query.from) : null;
  let to = query.to ? new Date(query.to) : null;
  const month = query.month ? parseInt(query.month, 10) : null; // 1-12
  const year = query.year ? parseInt(query.year, 10) : null;
  if (!from && !to && (month || year)) {
    const y = year || new Date().getFullYear();
    const m = (month || 1) - 1;
    from = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
    to = new Date(end.getTime() - 1);
  }
  return { from, to };
}

function withinRange(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function runningBalance(rows) {
  let bal = 0;
  return rows.map(r => ({ ...r, balance: (bal += r.amount) }));
}

// NOTE: Since PaymentVoucher is not used in Sequelize mode, this ledger lists
// confirmed Vendor Bills (creditors +) and Customer Invoices (debtors +).
// If you later add a PaymentVoucher model, we can include payment entries here.
exports.getPartnerLedger = async (req, res, next) => {
  try {
    const { from, to } = parseDateFilter(req.query);
    const q = (req.query.q || '').trim().toLowerCase();
    const partnerId = req.query.partner; // Contact id (customer or vendor)

    // Load contacts (optionally filtered)
    const whereContact = {};
    if (partnerId) whereContact.id = partnerId;
    const contacts = await Contact.findAll({ where: whereContact, attributes: ['id', 'name', 'type'], raw: true });
    const contactMap = new Map(contacts.map(c => [String(c.id), { name: c.name, type: c.type }]));

    // Queries for docs
    const billWhere = { status: 'confirmed' };
    if (partnerId) billWhere.vendor_id = partnerId;
    const invWhere = { status: 'confirmed' };
    if (partnerId) invWhere.customer_id = partnerId;

    const [bills, invoices] = await Promise.all([
      VendorBill.findAll({ where: billWhere, attributes: ['bill_number','vendor_id','invoice_date','due_date','total_amount'], raw: true }),
      Invoice.findAll({ where: invWhere, attributes: ['invoice_number','customer_id','invoice_date','due_date','total_amount'], raw: true }),
    ]);

    const rows = [];

    // Vendor bills → Creditor A/c increase (positive)
    for (const b of bills) {
      const invDate = b.invoice_date ? new Date(b.invoice_date) : null;
      if (from || to) {
        if (!withinRange(invDate, from, to)) continue;
      }
      const pid = String(b.vendor_id);
      const pinfo = contactMap.get(pid) || { name: 'Vendor', type: 'Vendor' };
      const partnerName = pinfo.name;
      const accName = 'Creditor A/c';
      const ref = b.bill_number;
      const date = invDate;
      const due = b.due_date ? new Date(b.due_date) : null;
      const amount = Number(b.total_amount || 0); // +ve
      if (q && !(partnerName.toLowerCase().includes(q) || String(ref).toLowerCase().includes(q))) continue;
      rows.push({ partnerId: pid, partnerName, accountName: accName, refNumber: ref, date, dueDate: due, amount });
    }

    // Customer invoices → Debtors A/c increase (positive)
    for (const inv of invoices) {
      const invDate = inv.invoice_date ? new Date(inv.invoice_date) : null;
      if (from || to) {
        if (!withinRange(invDate, from, to)) continue;
      }
      const pid = String(inv.customer_id);
      const cinfo = contactMap.get(pid) || { name: 'Customer', type: 'Customer' };
      const partnerName = cinfo.name;
      const accName = 'Debtors A/c';
      const ref = inv.invoice_number || 'INV';
      const date = invDate;
      const due = inv.due_date ? new Date(inv.due_date) : null;
      const amount = Number(inv.total_amount || 0); // +ve
      if (q && !(partnerName.toLowerCase().includes(q) || String(ref).toLowerCase().includes(q))) continue;
      rows.push({ partnerId: pid, partnerName, accountName: accName, refNumber: ref, date, dueDate: due, amount });
    }

    // Sort by date then ref
    rows.sort((a, b) => new Date(a.date) - new Date(b.date) || String(a.refNumber).localeCompare(String(b.refNumber)));

    // If a single partner filter, compute running balance like the UI
    let output = rows;
    if (partnerId) {
      output = runningBalance(rows);
    }

    res.json({ success: true, items: output, count: output.length });
  } catch (err) { next(err); }
};
