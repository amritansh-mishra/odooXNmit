import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import ProductForm from './ProductForm';
import productsService from '../../services/productsService';

const ProductMaster = ({ onBack, onHome }) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formMode, setFormMode] = useState('new');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productsService.getProducts({ limit: 50 });
      const items = Array.isArray(data.items) ? data.items : [];
      setProducts(items);
    } catch (e) {
      console.error(e);
      setError('Unable to fetch products from server. Showing demo data.');
      setProducts([
        {
          id: 1,
          name: 'Office Chair Premium',
          type: 'Goods',
          category: 'Furniture',
          hsnCode: '940370',
          salesPrice: 15000,
          salesTax: 18,
          purchasePrice: 12000,
          purchaseTax: 18
        },
        {
          id: 2,
          name: 'Wooden Dining Table',
          type: 'Goods',
          category: 'Furniture',
          hsnCode: '940360',
          salesPrice: 25000,
          salesTax: 18,
          purchasePrice: 20000,
          purchaseTax: 18
        },
        {
          id: 3,
          name: 'Interior Design Service',
          type: 'Service',
          category: 'Design',
          hsnCode: '998314',
          salesPrice: 50000,
          salesTax: 18,
          purchasePrice: 40000,
          purchaseTax: 18
        },
        {
          id: 4,
          name: 'Sofa Set 3+2',
          type: 'Goods',
          category: 'Furniture',
          hsnCode: '940170',
          salesPrice: 45000,
          salesTax: 18,
          purchasePrice: 35000,
          purchaseTax: 18
        },
        {
          id: 5,
          name: 'Wardrobe Installation',
          type: 'Service',
          category: 'Installation',
          hsnCode: '998313',
          salesPrice: 8000,
          salesTax: 18,
          purchasePrice: 6000,
          purchaseTax: 18
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaved = (savedItem, mode) => {
    if (!savedItem) return;
    if (mode === 'new') {
      setProducts((prev) => [savedItem, ...prev]);
      showToast('Product created');
    } else {
      setProducts((prev) => prev.map((p) => (p.id === savedItem.id ? { ...p, ...savedItem } : p)));
      showToast('Product updated');
    }
  };

  const handleDeleted = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product deleted');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleNewProduct = () => {
    setSelectedProduct(null);
    setFormMode('new');
    setShowForm(true);
  };

  const handleBackFromForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
    // Refresh products list after form submission
    loadProducts();
  };

  // If showing form, render ProductForm
  if (showForm) {
    return (
      <ProductForm
        onBack={handleBackFromForm}
        onHome={onHome}
        product={selectedProduct}
        mode={formMode}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--background)'}}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="shiv-surface shiv-shadow border-b"
        style={{borderColor: 'var(--border)'}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mr-4"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--border)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--border-light)'}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <h1 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
                Product Master
              </h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="shiv-surface rounded-xl overflow-hidden"
          style={{
            border: `2px solid var(--border)`,
            boxShadow: '0 8px 24px var(--shadow)',
            backgroundColor: 'var(--surface)'
          }}
        >
          {/* List View Header */}
          <div className="p-6 border-b" style={{borderColor: 'var(--border)'}}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>
                List View
              </h2>
              <motion.button
                className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary)'}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary)'}
                onClick={handleNewProduct}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </motion.button>
            </div>
            {error && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{error}</p>
            )}
          </div>

          {/* Toast Message */}
          {toast && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-6 mb-4">
              <p className="text-yellow-800 text-sm">{toast}</p>
            </div>
          )}

          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-4 border-b font-semibold text-sm"
               style={{
                 borderColor: 'var(--border)',
                 backgroundColor: 'var(--border-light)',
                 color: 'var(--text-primary)'
               }}>
            <div>Product Name</div>
            <div>Type</div>
            <div>Category</div>
            <div>HSN/SAC Code</div>
            <div>Sales Price</div>
            <div>Sales Tax</div>
            <div>Purchase Price</div>
          </div>

          {/* Product Rows */}
          <div className="divide-y" style={{borderColor: 'var(--border)'}}>
            {loading ? (
              <div className="p-4 text-sm" style={{ color: 'var(--text-muted)' }}>Loading products...</div>
            ) : (
              products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="grid grid-cols-7 gap-4 p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)'
                  }}
                  whileHover={{ 
                    backgroundColor: 'var(--border-light)',
                    scale: 1.01,
                    boxShadow: '0 4px 12px var(--shadow)'
                  }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleProductClick(product)}
                >
                  {/* Product Name */}
                  <div className="flex items-center">
                    <span className="font-medium" style={{color: 'var(--text-primary)'}}>
                      {product.name}
                    </span>
                  </div>

                  {/* Type */}
                  <div className="flex items-center">
                    <span className="text-sm px-2 py-1 rounded-full" 
                          style={{
                            color: product.type === 'Goods' ? 'var(--success)' : 'var(--info)',
                            backgroundColor: product.type === 'Goods' ? 'var(--success)' + '20' : 'var(--info)' + '20'
                          }}>
                      {product.type}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center">
                    <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                      {product.category}
                    </span>
                  </div>

                  {/* HSN/SAC Code */}
                  <div className="flex items-center">
                    <span className="text-sm font-mono" style={{color: 'var(--text-secondary)'}}>
                      {product.hsnCode || product.hsn_code}
                    </span>
                  </div>

                  {/* Sales Price */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
                      ₹{(product.salesPrice || product.sales_price || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Sales Tax */}
                  <div className="flex items-center">
                    <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
                      {product.salesTax || product.sales_tax || 0}%
                    </span>
                  </div>

                  {/* Purchase Price */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
                      ₹{(product.purchasePrice || product.purchase_price || 0).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}

            {/* Empty rows to match the design */}
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (products.length + index) * 0.05 }}
                className="grid grid-cols-7 gap-4 p-4 border-b"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  minHeight: '60px'
                }}
              >
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductMaster;
