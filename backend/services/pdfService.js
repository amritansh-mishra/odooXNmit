const PDFDocument = require('pdfkit');
const Contact = require('../models/Customer');

class PDFService {
  /**
   * Generate PDF for Purchase Order
   * @param {Object} po - Purchase Order data
   * @param {Object} res - Express response object
   */
  async generatePurchaseOrderPDF(po, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${po.po_number}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Purchase Order', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12)
      .text(`PO No: ${po.po_number}`)
      .text(`PO Date: ${new Date(po.po_date).toDateString()}`)
      .text(`Status: ${po.status}`)
      .text(`Reference: ${po.reference || '-'}`)
      .moveDown(0.5);

    // Vendor details
    if (po.vendor_id) {
      const vendor = await Contact.findByPk(po.vendor_id);
      if (vendor) {
        doc.fontSize(12).text('Vendor:', { underline: true });
        doc.text(`Name: ${vendor.name || ''}`)
           .text(`Email: ${vendor.email || ''}`)
           .text(`Mobile: ${vendor.mobile || ''}`)
           .moveDown(0.5);
      }
    }

    // Items
    doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
    if (po.items && Array.isArray(po.items)) {
      po.items.forEach((item, idx) => {
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${item.productName || 'Item'} | HSN: ${item.hsnCode || ''}`)
          .text(`Qty: ${item.quantity}  Unit Price: ${item.unitPrice}  Total: ${(item.quantity * item.unitPrice).toFixed(2)}`);
      });
    }

    // Total
    doc.moveDown(0.75);
    doc.fontSize(12).text('Total:', { underline: true });
    doc.text(`Amount: ${Number(po.total_amount || 0).toFixed(2)}`);

    doc.end();
  }

  /**
   * Generate PDF for Sales Order
   * @param {Object} so - Sales Order data
   * @param {Object} res - Express response object
   */
  async generateSalesOrderPDF(so, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${so.so_number}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Sales Order', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12)
      .text(`SO No: ${so.so_number}`)
      .text(`SO Date: ${new Date(so.so_date).toDateString()}`)
      .text(`Status: ${so.status}`)
      .text(`Reference: ${so.reference || '-'}`)
      .moveDown(0.5);

    // Customer details
    if (so.customer_id) {
      const customer = await Contact.findByPk(so.customer_id);
      if (customer) {
        doc.fontSize(12).text('Customer:', { underline: true });
        doc.text(`Name: ${customer.name || ''}`)
           .text(`Email: ${customer.email || ''}`)
           .text(`Mobile: ${customer.mobile || ''}`)
           .moveDown(0.5);
      }
    }

    // Items
    doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
    if (so.items && Array.isArray(so.items)) {
      so.items.forEach((item, idx) => {
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${item.productName || 'Item'} | HSN: ${item.hsnCode || ''}`)
          .text(`Qty: ${item.quantity}  Unit Price: ${item.unitPrice}  Total: ${(item.quantity * item.unitPrice).toFixed(2)}`);
      });
    }

    // Total
    doc.moveDown(0.75);
    doc.fontSize(12).text('Total:', { underline: true });
    doc.text(`Amount: ${Number(so.total_amount || 0).toFixed(2)}`);

    doc.end();
  }

  /**
   * Generate PDF for Vendor Bill
   * @param {Object} bill - Vendor Bill data
   * @param {Object} res - Express response object
   */
  async generateVendorBillPDF(bill, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${bill.bill_number}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Vendor Bill', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12)
      .text(`Bill No: ${bill.bill_number}`)
      .text(`Bill Date: ${new Date(bill.invoice_date).toDateString()}`)
      .text(`Due Date: ${bill.due_date ? new Date(bill.due_date).toDateString() : '-'}`)
      .text(`Status: ${bill.status}`)
      .moveDown(0.5);

    // Vendor details
    if (bill.vendor_id) {
      const vendor = await Contact.findByPk(bill.vendor_id);
      if (vendor) {
        doc.fontSize(12).text('Vendor:', { underline: true });
        doc.text(`Name: ${vendor.name || ''}`)
           .text(`Email: ${vendor.email || ''}`)
           .text(`Mobile: ${vendor.mobile || ''}`)
           .moveDown(0.5);
      }
    }

    // Items
    doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
    if (bill.items && Array.isArray(bill.items)) {
      bill.items.forEach((item, idx) => {
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${item.productName || 'Item'} | HSN: ${item.hsnCode || ''}`)
          .text(`Qty: ${item.quantity}  Unit Price: ${item.unitPrice}  Total: ${(item.quantity * item.unitPrice).toFixed(2)}`);
      });
    }

    // Totals
    doc.moveDown(0.75);
    doc.fontSize(12).text('Totals:', { underline: true });
    doc.text(`Subtotal: ${Number(bill.untaxed_amount || 0).toFixed(2)}`)
       .text(`Tax: ${Number(bill.tax_amount || 0).toFixed(2)}`)
       .text(`Total: ${Number(bill.total_amount || 0).toFixed(2)}`)
       .text(`Amount Due: ${Number(bill.amount_due || 0).toFixed(2)}`);

    doc.end();
  }

  /**
   * Generate PDF for Customer Invoice
   * @param {Object} invoice - Customer Invoice data
   * @param {Object} res - Express response object
   */
  async generateCustomerInvoicePDF(invoice, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 36 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${invoice.invoice_number}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('Customer Invoice', { align: 'center' }).moveDown(0.5);
    doc.fontSize(12)
      .text(`Invoice No: ${invoice.invoice_number}`)
      .text(`Invoice Date: ${new Date(invoice.invoice_date).toDateString()}`)
      .text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toDateString() : '-'}`)
      .text(`Status: ${invoice.status}`)
      .moveDown(0.5);

    // Customer details
    if (invoice.customer_id) {
      const customer = await Contact.findByPk(invoice.customer_id);
      if (customer) {
        doc.fontSize(12).text('Customer:', { underline: true });
        doc.text(`Name: ${customer.name || ''}`)
           .text(`Email: ${customer.email || ''}`)
           .text(`Mobile: ${customer.mobile || ''}`)
           .moveDown(0.5);
      }
    }

    // Items
    doc.fontSize(12).text('Items:', { underline: true }).moveDown(0.25);
    if (invoice.items && Array.isArray(invoice.items)) {
      invoice.items.forEach((item, idx) => {
        doc.moveDown(0.15)
          .text(`${idx + 1}. ${item.productName || 'Item'} | HSN: ${item.hsnCode || ''}`)
          .text(`Qty: ${item.quantity}  Unit Price: ${item.unitPrice}  Total: ${(item.quantity * item.unitPrice).toFixed(2)}`);
      });
    }

    // Totals
    doc.moveDown(0.75);
    doc.fontSize(12).text('Totals:', { underline: true });
    doc.text(`Subtotal: ${Number(invoice.untaxed_amount || 0).toFixed(2)}`)
       .text(`Tax: ${Number(invoice.tax_amount || 0).toFixed(2)}`)
       .text(`Total: ${Number(invoice.total_amount || 0).toFixed(2)}`)
       .text(`Amount Due: ${Number(invoice.amount_due || 0).toFixed(2)}`);

    doc.end();
  }

  /**
   * Generate JSON payload for printing (non-PDF format)
   * @param {Object} data - Document data
   * @param {String} type - Document type (po, so, bill, invoice)
   * @returns {Object} - Formatted print payload
   */
  generatePrintPayload(data, type) {
    const basePayload = {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      items: data.items || [],
    };

    switch (type) {
      case 'po':
        return {
          ...basePayload,
          poNumber: data.po_number,
          poDate: data.po_date,
          status: data.status,
          reference: data.reference,
          vendor: data.vendor_id,
          totals: { total: Number(data.total_amount) || 0 }
        };
      
      case 'so':
        return {
          ...basePayload,
          soNumber: data.so_number,
          soDate: data.so_date,
          status: data.status,
          reference: data.reference,
          customer: data.customer_id,
          totals: { total: Number(data.total_amount) || 0 }
        };
      
      case 'bill':
        return {
          ...basePayload,
          billNumber: data.bill_number,
          invoiceDate: data.invoice_date,
          dueDate: data.due_date,
          status: data.status,
          vendor: data.vendor_id,
          totals: {
            untaxed: Number(data.untaxed_amount) || 0,
            tax: Number(data.tax_amount) || 0,
            total: Number(data.total_amount) || 0,
            amountDue: Number(data.amount_due) || 0
          }
        };
      
      case 'invoice':
        return {
          ...basePayload,
          invoiceNumber: data.invoice_number,
          invoiceDate: data.invoice_date,
          dueDate: data.due_date,
          status: data.status,
          customer: data.customer_id,
          totals: {
            untaxed: Number(data.untaxed_amount) || 0,
            tax: Number(data.tax_amount) || 0,
            total: Number(data.total_amount) || 0,
            amountDue: Number(data.amount_due) || 0
          }
        };
      
      default:
        return basePayload;
    }
  }
}

module.exports = new PDFService();
