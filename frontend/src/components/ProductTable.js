import React, { useState } from 'react';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ProductTable.css';

const ProductTable = ({ products, onUpdate, onSelectProduct }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...editForm,
        stock: parseInt(editForm.stock),
        status: parseInt(editForm.stock) > 0 ? 'In Stock' : 'Out of Stock'
      };

      await productAPI.updateProduct(editingId, updatedData);
      toast.success('Product updated successfully!');
      setEditingId(null);
      setEditForm({});
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        toast.success('Product deleted successfully!');
        onUpdate();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete product');
      }
    }
  };

  const getStatusClass = (stock) => {
    return stock > 0 ? 'status-in-stock' : 'status-out-of-stock';
  };

  const getStatusText = (stock) => {
    return stock > 0 ? 'In Stock' : 'Out of Stock';
  };

  return (
    <div className="table-container">
      <table className="product-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Unit</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="8" className="no-data">No products found</td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id} onClick={() => onSelectProduct(product)}>
                <td>
                  <img src={product.image} alt={product.name} className="product-image" />
                </td>
                {editingId === product.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="unit"
                        value={editForm.unit}
                        onChange={handleChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="category"
                        value={editForm.category}
                        onChange={handleChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="brand"
                        value={editForm.brand}
                        onChange={handleChange}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name="stock"
                        value={editForm.stock}
                        onChange={handleChange}
                        onClick={(e) => e.stopPropagation()}
                        min="0"
                      />
                    </td>
                    <td>
                      <span className={getStatusClass(editForm.stock)}>
                        {getStatusText(editForm.stock)}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {/* FIX: Use actions-container for spacing and layout control */}
                      <div className="actions-container"> 
                        <button className="btn-save" onClick={handleSave}>Save</button>
                        <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{product.name}</td>
                    <td>{product.unit}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={getStatusClass(product.stock)}>
                        {product.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                       {/* FIX: Use actions-container for spacing and layout control */}
                      <div className="actions-container">
                        <button className="btn-edit" onClick={() => handleEdit(product)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(product.id)}>Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;