const db = require('../config/database');
const fs = require('fs');
const csv = require('csv-parser');
const { validationResult } = require('express-validator');

// Get all products
exports.getAllProducts = (req, res) => {
  const query = 'SELECT * FROM products ORDER BY id DESC';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
};

// Search products by name
exports.searchProducts = (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ success: false, error: 'Search term is required' });
  }

  const query = 'SELECT * FROM products WHERE LOWER(name) LIKE LOWER(?) ORDER BY id DESC';
  
  db.all(query, [`%${name}%`], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
};

// Get product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  
  const query = 'SELECT * FROM products WHERE id = ?';
  
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!row) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: row });
  });
};

// Create new product
exports.createProduct = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, unit, category, brand, stock, status, image } = req.body;
  
  const query = `
    INSERT INTO products (name, unit, category, brand, stock, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [name, unit, category, brand, stock, status, image || 'https://via.placeholder.com/50'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ success: false, error: 'Product name already exists' });
      }
      return res.status(500).json({ success: false, error: err.message });
    }
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: this.lastID }
    });
  });
};

// Update product
exports.updateProduct = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { id } = req.params;
  const { name, unit, category, brand, stock, status, image } = req.body;

  // First, get the old stock value
  db.get('SELECT stock FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const oldStock = product.stock;
    const newStock = parseInt(stock);

    // Update product
    const updateQuery = `
      UPDATE products 
      SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ?, image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateQuery, [name, unit, category, brand, newStock, status, image, id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ success: false, error: 'Product name already exists' });
        }
        return res.status(500).json({ success: false, error: err.message });
      }

      // If stock changed, log it in history
      if (oldStock !== newStock) {
        const historyQuery = `
          INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, changed_by)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(historyQuery, [id, oldStock, newStock, new Date().toISOString(), 'admin'], (historyErr) => {
          if (historyErr) {
            console.error('Error logging inventory history:', historyErr);
          }
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { id, name, unit, category, brand, stock: newStock, status, image }
      });
    });
  });
};

// Delete product
exports.deleteProduct = (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM products WHERE id = ?';
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  });
};

// Import products from CSV
exports.importProducts = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const results = [];
  const duplicates = [];
  let added = 0;
  let skipped = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Delete uploaded file after reading
      fs.unlinkSync(req.file.path);

      const insertPromises = results.map((product) => {
        return new Promise((resolve) => {
          // Check for duplicate
          db.get('SELECT id FROM products WHERE LOWER(name) = LOWER(?)', [product.name], (err, row) => {
            if (row) {
              duplicates.push({ name: product.name, existingId: row.id });
              skipped++;
              resolve();
            } else {
              // Insert new product
              const query = `
                INSERT INTO products (name, unit, category, brand, stock, status, image)
                VALUES (?, ?, ?, ?, ?, ?, ?)
              `;
              
              db.run(
                query,
                [
                  product.name,
                  product.unit || 'piece',
                  product.category || 'General',
                  product.brand || 'Generic',
                  parseInt(product.stock) || 0,
                  product.status || (parseInt(product.stock) > 0 ? 'In Stock' : 'Out of Stock'),
                  product.image || 'https://via.placeholder.com/50'
                ],
                (err) => {
                  if (err) {
                    skipped++;
                  } else {
                    added++;
                  }
                  resolve();
                }
              );
            }
          });
        });
      });

      Promise.all(insertPromises).then(() => {
        res.json({
          success: true,
          added,
          skipped,
          duplicates
        });
      });
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      res.status(500).json({ success: false, error: error.message });
    });
};

// Export products to CSV
exports.exportProducts = (req, res) => {
  const query = 'SELECT name, unit, category, brand, stock, status, image FROM products';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    // Create CSV string
    const headers = 'name,unit,category,brand,stock,status,image\n';
    const csvData = rows.map(row => 
      `"${row.name}","${row.unit}","${row.category}","${row.brand}",${row.stock},"${row.status}","${row.image}"`
    ).join('\n');

    const csv = headers + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.status(200).send(csv);
  });
};

// Get inventory history for a product
exports.getInventoryHistory = (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT * FROM inventory_history 
    WHERE product_id = ? 
    ORDER BY change_date DESC
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
};
