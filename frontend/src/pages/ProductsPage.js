import React, { useState, useEffect, useRef } from 'react';
import ProductTable from '../components/ProductTable';
import InventoryHistory from '../components/InventoryHistory';
import AddProductModal from '../components/AddProductModal';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      const productData = response.data.data;
      setProducts(productData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productData.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      try {
        const response = await productAPI.searchProducts(query);
        setFilteredProducts(response.data.data);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setFilteredProducts(products);
    }
  };

  const handleImport = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await productAPI.importCSV(file);
      const { added, skipped, duplicates } = response.data;
      
      toast.success(`Import complete! Added: ${added}, Skipped: ${skipped}`);
      
      if (duplicates.length > 0) {
        console.log('Duplicates found:', duplicates);
      }
      
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to import CSV');
    }

    // Reset file input
    e.target.value = '';
  };

  const handleExport = async () => {
    try {
      const response = await productAPI.exportCSV();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Products exported successfully!');
    } catch (error) {
      toast.error('Failed to export products');
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseHistory = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Product Inventory Management</h1>
      </div>

      <div className="controls-bar">
        <div className="left-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
          />

          <select
            className="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            + Add New Product
          </button>
        </div>

        <div className="right-controls">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            style={{ display: 'none' }}
          />
          <button className="btn-import" onClick={handleImport}>
            📥 Import CSV
          </button>
          <button className="btn-export" onClick={handleExport}>
            📤 Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading products...</p>
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onUpdate={fetchProducts}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {selectedProduct && (
        <InventoryHistory
          product={selectedProduct}
          onClose={handleCloseHistory}
        />
      )}

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onProductAdded={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductsPage;
