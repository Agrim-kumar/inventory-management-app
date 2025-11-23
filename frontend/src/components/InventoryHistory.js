import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import './InventoryHistory.css';

const InventoryHistory = ({ product, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (product) {
      fetchHistory();
    }
  }, [product]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getInventoryHistory(product.id);
      setHistory(response.data.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!product) return null;

  return (
    <div className="history-sidebar">
      <div className="history-header">
        <h3>Inventory History</h3>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      
      <div className="history-product-info">
        <h4>{product.name}</h4>
        <p>Current Stock: <strong>{product.stock}</strong></p>
      </div>

      <div className="history-content">
        {loading ? (
          <p className="loading">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="no-history">No inventory changes recorded</p>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-date">{formatDate(entry.change_date)}</div>
                <div className="history-change">
                  <span className="old-qty">{entry.old_quantity}</span>
                  <span className="arrow">→</span>
                  <span className="new-qty">{entry.new_quantity}</span>
                </div>
                <div className="history-user">Changed by: {entry.changed_by}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;
