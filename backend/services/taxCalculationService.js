/**
 * Tax Calculation Service
 * Handles GST calculations, tax breakdowns, and HSN code integration
 */

const Tax = require('../models/Tax');
const Product = require('../models/Product');

class TaxCalculationService {
  /**
   * Calculate detailed tax breakdown for order items
   * @param {Array} items - Array of order items
   * @param {String} orderType - 'sales' or 'purchase'
   * @returns {Object} - Detailed tax calculation
   */
  async calculateOrderTax(items, orderType = 'sales') {
    const calculation = {
      subtotal: 0,
      totalTaxAmount: 0,
      totalAmount: 0,
      taxBreakdown: {
        cgst: 0,
        sgst: 0,
        igst: 0,
        cess: 0,
        other: 0
      },
      itemsWithTax: []
    };

    for (const item of items) {
      const itemCalc = await this.calculateItemTax(item, orderType);
      
      calculation.subtotal += itemCalc.subtotal;
      calculation.totalTaxAmount += itemCalc.totalTaxAmount;
      
      // Add to tax breakdown
      calculation.taxBreakdown.cgst += itemCalc.taxBreakdown.cgst;
      calculation.taxBreakdown.sgst += itemCalc.taxBreakdown.sgst;
      calculation.taxBreakdown.igst += itemCalc.taxBreakdown.igst;
      calculation.taxBreakdown.cess += itemCalc.taxBreakdown.cess;
      calculation.taxBreakdown.other += itemCalc.taxBreakdown.other;
      
      calculation.itemsWithTax.push(itemCalc);
    }

    calculation.totalAmount = calculation.subtotal + calculation.totalTaxAmount;

    // Round all amounts to 2 decimal places
    this.roundCalculation(calculation);

    return calculation;
  }

  /**
   * Calculate tax for a single item
   * @param {Object} item - Order item
   * @param {String} orderType - 'sales' or 'purchase'
   * @returns {Object} - Item tax calculation
   */
  async calculateItemTax(item, orderType) {
    const itemCalc = {
      ...item,
      subtotal: 0,
      totalTaxAmount: 0,
      totalAmount: 0,
      taxBreakdown: {
        cgst: 0,
        sgst: 0,
        igst: 0,
        cess: 0,
        other: 0
      },
      taxDetails: []
    };

    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    itemCalc.subtotal = quantity * unitPrice;

    // Get product details for HSN code
    if (item.product) {
      try {
        const product = await Product.findByPk(item.product);
        if (product) {
          itemCalc.hsnCode = product.hsn_code;
          itemCalc.productName = product.name;
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    }

    // Calculate taxes
    if (item.tax) {
      const taxDoc = await Tax.findByPk(item.tax);
      if (taxDoc) {
        const taxAmount = this.calculateTaxAmount(itemCalc.subtotal, taxDoc);
        itemCalc.totalTaxAmount += taxAmount;

        // Categorize tax based on name/type
        const taxCategory = this.categorizeTax(taxDoc.name);
        itemCalc.taxBreakdown[taxCategory] += taxAmount;

        itemCalc.taxDetails.push({
          taxId: taxDoc.id,
          taxName: taxDoc.name,
          taxRate: taxDoc.value,
          taxMethod: taxDoc.method,
          taxAmount: taxAmount,
          category: taxCategory
        });
      }
    }

    // Handle multiple taxes if item has taxIds array
    if (item.taxIds && Array.isArray(item.taxIds)) {
      for (const taxId of item.taxIds) {
        const taxDoc = await Tax.findByPk(taxId);
        if (taxDoc) {
          const taxAmount = this.calculateTaxAmount(itemCalc.subtotal, taxDoc);
          itemCalc.totalTaxAmount += taxAmount;

          const taxCategory = this.categorizeTax(taxDoc.name);
          itemCalc.taxBreakdown[taxCategory] += taxAmount;

          itemCalc.taxDetails.push({
            taxId: taxDoc.id,
            taxName: taxDoc.name,
            taxRate: taxDoc.value,
            taxMethod: taxDoc.method,
            taxAmount: taxAmount,
            category: taxCategory
          });
        }
      }
    }

    itemCalc.totalAmount = itemCalc.subtotal + itemCalc.totalTaxAmount;

    return itemCalc;
  }

  /**
   * Calculate tax amount based on tax method
   * @param {Number} baseAmount - Base amount to calculate tax on
   * @param {Object} taxDoc - Tax document
   * @returns {Number} - Tax amount
   */
  calculateTaxAmount(baseAmount, taxDoc) {
    if (taxDoc.method === 'Percentage' || taxDoc.method === 'percentage') {
      return (baseAmount * (Number(taxDoc.value) || 0)) / 100;
    } else if (taxDoc.method === 'Fixed' || taxDoc.method === 'fixed') {
      return Number(taxDoc.value) || 0;
    }
    return 0;
  }

  /**
   * Categorize tax based on name
   * @param {String} taxName - Name of the tax
   * @returns {String} - Tax category
   */
  categorizeTax(taxName) {
    const name = taxName.toLowerCase();
    if (name.includes('cgst')) return 'cgst';
    if (name.includes('sgst')) return 'sgst';
    if (name.includes('igst')) return 'igst';
    if (name.includes('cess')) return 'cess';
    return 'other';
  }

  /**
   * Round all amounts in calculation to 2 decimal places
   * @param {Object} calculation - Calculation object to round
   */
  roundCalculation(calculation) {
    calculation.subtotal = Math.round(calculation.subtotal * 100) / 100;
    calculation.totalTaxAmount = Math.round(calculation.totalTaxAmount * 100) / 100;
    calculation.totalAmount = Math.round(calculation.totalAmount * 100) / 100;

    // Round tax breakdown
    Object.keys(calculation.taxBreakdown).forEach(key => {
      calculation.taxBreakdown[key] = Math.round(calculation.taxBreakdown[key] * 100) / 100;
    });

    // Round item calculations
    if (calculation.itemsWithTax) {
      calculation.itemsWithTax.forEach(item => {
        item.subtotal = Math.round(item.subtotal * 100) / 100;
        item.totalTaxAmount = Math.round(item.totalTaxAmount * 100) / 100;
        item.totalAmount = Math.round(item.totalAmount * 100) / 100;

        Object.keys(item.taxBreakdown).forEach(key => {
          item.taxBreakdown[key] = Math.round(item.taxBreakdown[key] * 100) / 100;
        });

        if (item.taxDetails) {
          item.taxDetails.forEach(tax => {
            tax.taxAmount = Math.round(tax.taxAmount * 100) / 100;
          });
        }
      });
    }
  }

  /**
   * Get GST rate suggestions based on HSN code
   * @param {String} hsnCode - HSN code
   * @returns {Object} - GST rate suggestions
   */
  async getGSTRateByHSN(hsnCode) {
    // This will be integrated with your HSN API
    // For now, return common GST rates
    const commonRates = {
      '0': { cgst: 0, sgst: 0, igst: 0, description: 'Exempt' },
      '5': { cgst: 2.5, sgst: 2.5, igst: 5, description: 'Essential items' },
      '12': { cgst: 6, sgst: 6, igst: 12, description: 'Standard items' },
      '18': { cgst: 9, sgst: 9, igst: 18, description: 'Most goods and services' },
      '28': { cgst: 14, sgst: 14, igst: 28, description: 'Luxury items' }
    };

    // Default to 18% if HSN not found
    return commonRates['18'];
  }

  /**
   * Validate tax calculation
   * @param {Object} calculation - Tax calculation to validate
   * @returns {Object} - Validation result
   */
  validateTaxCalculation(calculation) {
    const errors = [];
    const warnings = [];

    // Check if total amount matches subtotal + tax
    const expectedTotal = calculation.subtotal + calculation.totalTaxAmount;
    if (Math.abs(expectedTotal - calculation.totalAmount) > 0.01) {
      errors.push('Total amount calculation mismatch');
    }

    // Check for negative amounts
    if (calculation.subtotal < 0) errors.push('Negative subtotal');
    if (calculation.totalTaxAmount < 0) errors.push('Negative tax amount');

    // Check tax breakdown sum
    const taxBreakdownSum = Object.values(calculation.taxBreakdown).reduce((sum, val) => sum + val, 0);
    if (Math.abs(taxBreakdownSum - calculation.totalTaxAmount) > 0.01) {
      warnings.push('Tax breakdown sum does not match total tax amount');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

module.exports = new TaxCalculationService();
