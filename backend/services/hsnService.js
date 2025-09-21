
const axios = require('axios');

class HSNService {
  constructor() {
    // Official GST government API
    this.baseURL = 'https://services.gst.gov.in/commonservices/hsn/search';
    this.timeout = 15000; // 15 seconds timeout for government API
  }

  /**
   * Search HSN codes by product name or description using official GST API
   * @param {String} query - Search query
   * @param {Number} limit - Number of results to return
   * @returns {Array} - Array of HSN codes with details
   */
  async searchHSNByProduct(query, limit = 10) {
    try {
      console.log(`🔍 Searching HSN for product: "${query}"`);
      
      // Search by description for products
      const response = await axios.get(`${this.baseURL}/q`, {
        params: {
          inputText: query,
          selectedType: 'byDesc',
          category: 'P' // P for products/goods
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'OdooXNmit-HSN-Service/1.0',
          'Accept': 'application/json'
        }
      });

      console.log('✅ HSN API Response received');
      return this.formatHSNSearchResults(response.data, limit);
    } catch (error) {
      console.error('❌ Error searching HSN codes via government API:', error.message);
      
      // Return fallback data for common products
      return this.getFallbackHSNData(query).slice(0, limit);
    }
  }

  /**
   * Search HSN codes by HSN code using official GST API
   * @param {String} hsnCode - HSN code to search
   * @returns {Array} - Array of HSN code details
   */
  async searchHSNByCode(hsnCode) {
    try {
      console.log(`🔍 Searching HSN by code: "${hsnCode}"`);
      
      // Search by HSN code
      const response = await axios.get(`${this.baseURL}/q`, {
        params: {
          inputText: hsnCode,
          selectedType: 'byCode',
          category: 'null' // null for code search
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'OdooXNmit-HSN-Service/1.0',
          'Accept': 'application/json'
        }
      });

      console.log('✅ HSN Code API Response received');
      return this.formatHSNSearchResults(response.data);
    } catch (error) {
      console.error('❌ Error searching HSN by code via government API:', error.message);
      
      // Return fallback data
      return [this.getFallbackHSNDetails(hsnCode)];
    }
  }

  /**
   * Search HSN codes for services using official GST API
   * @param {String} query - Service description
   * @param {Number} limit - Number of results to return
   * @returns {Array} - Array of HSN codes for services
   */
  async searchHSNByService(query, limit = 10) {
    try {
      console.log(`🔍 Searching HSN for service: "${query}"`);
      
      // Search by description for services
      const response = await axios.get(`${this.baseURL}/q`, {
        params: {
          inputText: query,
          selectedType: 'byDesc',
          category: 'S' // S for services
        },
        timeout: this.timeout,
        headers: {
          'User-Agent': 'OdooXNmit-HSN-Service/1.0',
          'Accept': 'application/json'
        }
      });

      console.log('✅ HSN Service API Response received');
      return this.formatHSNSearchResults(response.data, limit);
    } catch (error) {
      console.error('❌ Error searching HSN for services via government API:', error.message);
      
      // Return fallback data for common services
      return this.getFallbackServiceHSNData(query).slice(0, limit);
    }
  }

  /**
   * Get HSN code details by HSN code
   * @param {String} hsnCode - HSN code (4, 6, or 8 digits)
   * @returns {Object} - HSN code details with GST rates
   */
  async getHSNDetails(hsnCode) {
    try {
      const searchResults = await this.searchHSNByCode(hsnCode);
      
      if (searchResults && searchResults.length > 0) {
        // Return the first matching result
        const hsnDetails = searchResults[0];
        
        // Add GST rate information (government API might not include rates)
        const gstRates = this.getGSTRatesByCategory(hsnDetails.category || 'General');
        
        return {
          ...hsnDetails,
          ...gstRates
        };
      }
      
      // Return fallback data if no results
      return this.getFallbackHSNDetails(hsnCode);
    } catch (error) {
      console.error('❌ Error fetching HSN details:', error.message);
      return this.getFallbackHSNDetails(hsnCode);
    }
  }

  /**
   * Get GST rates for a specific HSN code
   * @param {String} hsnCode - HSN code
   * @returns {Object} - GST rate breakdown
   */
  async getGSTRates(hsnCode) {
    try {
      const hsnDetails = await this.getHSNDetails(hsnCode);
      return {
        hsnCode: hsnCode,
        cgst: hsnDetails.cgst || 0,
        sgst: hsnDetails.sgst || 0,
        igst: hsnDetails.igst || 0,
        cess: hsnDetails.cess || 0,
        totalGST: hsnDetails.totalGST || 0,
        description: hsnDetails.description || '',
        category: hsnDetails.category || ''
      };
    } catch (error) {
      console.error('❌ Error fetching GST rates:', error.message);
      return this.getDefaultGSTRates();
    }
  }

  /**
   * Format HSN search results from government API response
   * @param {Object} apiData - Raw API response data
   * @param {Number} limit - Maximum number of results
   * @returns {Array} - Formatted HSN search results
   */
  formatHSNSearchResults(apiData, limit = 50) {
    try {
      let results = [];
      
      // The government API response structure may vary
      // Adjust this based on actual API response format
      if (apiData && Array.isArray(apiData)) {
        results = apiData;
      } else if (apiData && apiData.data && Array.isArray(apiData.data)) {
        results = apiData.data;
      } else if (apiData && apiData.results && Array.isArray(apiData.results)) {
        results = apiData.results;
      }

      return results.slice(0, limit).map(item => {
        // Determine GST rates based on HSN code or category
        const gstRates = this.getGSTRatesByHSNCode(item.hsnCode || item.code || item.hsn);
        
        return {
          hsnCode: item.hsnCode || item.code || item.hsn || '',
          description: item.description || item.desc || item.commodity || '',
          category: item.category || this.getCategoryFromDescription(item.description || ''),
          cgst: gstRates.cgst,
          sgst: gstRates.sgst,
          igst: gstRates.igst,
          cess: gstRates.cess || 0,
          totalGST: gstRates.igst,
          source: 'government_api'
        };
      });
    } catch (error) {
      console.error('❌ Error formatting HSN search results:', error.message);
      return [];
    }
  }

  /**
   * Get GST rates based on HSN code patterns
   * @param {String} hsnCode - HSN code
   * @returns {Object} - GST rates
   */
  getGSTRatesByHSNCode(hsnCode) {
    if (!hsnCode) return this.getDefaultGSTRates();
    
    const code = String(hsnCode);
    
    // Common GST rate patterns based on HSN code ranges
    // These are approximate and should be verified with current GST rates
    
    // Essential items (5% GST)
    if (code.startsWith('10') || code.startsWith('11') || code.startsWith('07') || code.startsWith('08')) {
      return { cgst: 2.5, sgst: 2.5, igst: 5 };
    }
    
    // Standard items (12% GST)
    if (code.startsWith('61') || code.startsWith('62') || code.startsWith('63')) {
      return { cgst: 6, sgst: 6, igst: 12 };
    }
    
    // Luxury items (28% GST)
    if (code.startsWith('87') || code.startsWith('85') || code.startsWith('90')) {
      return { cgst: 14, sgst: 14, igst: 28 };
    }
    
    // Default to 18% GST (most common)
    return { cgst: 9, sgst: 9, igst: 18 };
  }

  /**
   * Get GST rates based on category
   * @param {String} category - Product category
   * @returns {Object} - GST rates
   */
  getGSTRatesByCategory(category) {
    const cat = String(category).toLowerCase();
    
    if (cat.includes('food') || cat.includes('grain') || cat.includes('essential')) {
      return { cgst: 2.5, sgst: 2.5, igst: 5 };
    }
    
    if (cat.includes('textile') || cat.includes('clothing')) {
      return { cgst: 6, sgst: 6, igst: 12 };
    }
    
    if (cat.includes('luxury') || cat.includes('automobile') || cat.includes('tobacco')) {
      return { cgst: 14, sgst: 14, igst: 28 };
    }
    
    // Default 18%
    return { cgst: 9, sgst: 9, igst: 18 };
  }

  /**
   * Get category from description
   * @param {String} description - Product description
   * @returns {String} - Category
   */
  getCategoryFromDescription(description) {
    const desc = String(description).toLowerCase();
    
    if (desc.includes('food') || desc.includes('grain') || desc.includes('rice') || desc.includes('wheat')) {
      return 'Food & Agriculture';
    }
    
    if (desc.includes('textile') || desc.includes('clothing') || desc.includes('fabric')) {
      return 'Textiles';
    }
    
    if (desc.includes('furniture') || desc.includes('chair') || desc.includes('table')) {
      return 'Furniture';
    }
    
    if (desc.includes('electronic') || desc.includes('computer') || desc.includes('mobile')) {
      return 'Electronics';
    }
    
    return 'General';
  }

  /**
   * Get fallback HSN data when API is unavailable
   * @param {String} query - Search query
   * @returns {Array} - Fallback HSN data
   */
  getFallbackHSNData(query) {
    const fallbackData = [
      { hsnCode: '9403', description: 'Other furniture and parts thereof', category: 'Furniture', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      { hsnCode: '8471', description: 'Automatic data processing machines and units thereof', category: 'Electronics', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      { hsnCode: '6403', description: 'Footwear with outer soles of rubber, plastics, leather', category: 'Footwear', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      { hsnCode: '6109', description: 'T-shirts, singlets and other vests, knitted or crocheted', category: 'Textiles', cgst: 6, sgst: 6, igst: 12, cess: 0 },
      { hsnCode: '1006', description: 'Rice', category: 'Food grains', cgst: 2.5, sgst: 2.5, igst: 5, cess: 0 },
      { hsnCode: '8517', description: 'Telephone sets, including smartphones', category: 'Electronics', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      { hsnCode: '3004', description: 'Medicaments consisting of mixed or unmixed products', category: 'Pharmaceuticals', cgst: 6, sgst: 6, igst: 12, cess: 0 }
    ];

    // Simple search in fallback data
    const searchTerm = query.toLowerCase();
    return fallbackData.filter(item => 
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm) ||
      item.hsnCode.includes(searchTerm)
    );
  }

  /**
   * Get fallback service HSN data
   * @param {String} query - Search query
   * @returns {Array} - Fallback service HSN data
   */
  getFallbackServiceHSNData(query) {
    const fallbackServices = [
      { hsnCode: '998313', description: 'Information technology software services', category: 'IT Services', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      { hsnCode: '997212', description: 'Accounting and bookkeeping services', category: 'Professional Services', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      { hsnCode: '996511', description: 'Transport of goods by road', category: 'Transportation', cgst: 2.5, sgst: 2.5, igst: 5, cess: 0 },
      { hsnCode: '997331', description: 'Advertising services', category: 'Marketing', cgst: 9, sgst: 9, igst: 18, cess: 0 }
    ];

    const searchTerm = query.toLowerCase();
    return fallbackServices.filter(item => 
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get fallback HSN details
   * @param {String} hsnCode - HSN code
   * @returns {Object} - Fallback HSN details
   */
  getFallbackHSNDetails(hsnCode) {
    const fallbackDetails = {
      '9403': { description: 'Other furniture and parts thereof', category: 'Furniture', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      '8471': { description: 'Automatic data processing machines', category: 'Electronics', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      '6403': { description: 'Footwear with outer soles', category: 'Footwear', cgst: 9, sgst: 9, igst: 18, cess: 0 },
      '6109': { description: 'T-shirts, singlets and other vests', category: 'Textiles', cgst: 6, sgst: 6, igst: 12, cess: 0 },
      '1006': { description: 'Rice', category: 'Food grains', cgst: 2.5, sgst: 2.5, igst: 5, cess: 0 }
    };

    const details = fallbackDetails[hsnCode] || this.getDefaultGSTRates();
    return {
      hsnCode: hsnCode,
      totalGST: details.igst,
      source: 'fallback',
      ...details
    };
  }

  /**
   * Get default GST rates (18% - most common)
   * @returns {Object} - Default GST rates
   */
  getDefaultGSTRates() {
    return {
      cgst: 9,
      sgst: 9,
      igst: 18,
      cess: 0,
      totalGST: 18,
      description: 'Standard rate',
      category: 'General'
    };
  }

  /**
   * Validate HSN code format
   * @param {String} hsnCode - HSN code to validate
   * @returns {Object} - Validation result
   */
  validateHSNCode(hsnCode) {
    const errors = [];
    const warnings = [];

    if (!hsnCode) {
      errors.push('HSN code is required');
      return { isValid: false, errors, warnings };
    }

    // Remove spaces and convert to string
    const cleanCode = String(hsnCode).replace(/\s/g, '');

    // Check if it's numeric
    if (!/^\d+$/.test(cleanCode)) {
      errors.push('HSN code must contain only digits');
    }

    // Check length (HSN codes are typically 4, 6, or 8 digits)
    if (![4, 6, 8].includes(cleanCode.length)) {
      warnings.push('HSN code should be 4, 6, or 8 digits long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      cleanCode
    };
  }

  /**
   * Bulk HSN lookup for multiple products
   * @param {Array} products - Array of products with names/descriptions
   * @returns {Array} - Array of products with HSN suggestions
   */
  async bulkHSNLookup(products) {
    const results = [];
    
    for (const product of products) {
      try {
        const hsnSuggestions = await this.searchHSNByProduct(product.name || product.description, 3);
        results.push({
          ...product,
          hsnSuggestions
        });
        
        // Add delay to avoid overwhelming the government API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error in bulk HSN lookup for product ${product.name}:`, error.message);
        results.push({
          ...product,
          hsnSuggestions: []
        });
      }
    }

    return results;
  }
}

module.exports = new HSNService();
