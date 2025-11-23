const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'inventory.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // Products table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        unit TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creating products table:', err);
      } else {
        console.log('Products table ready');
      }
    });

    // Inventory history table
    db.run(`
      CREATE TABLE IF NOT EXISTS inventory_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        old_quantity INTEGER NOT NULL,
        new_quantity INTEGER NOT NULL,
        change_date TEXT NOT NULL,
        changed_by TEXT DEFAULT 'admin',
        FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating inventory_history table:', err);
      } else {
        console.log('Inventory history table ready');
      }
    });

    // Insert sample data
    insertSampleData();
  });
}

function insertSampleData() {
  const sampleProducts = [
    ['Laptop', 'piece', 'Electronics', 'Dell', 15, 'In Stock', 'https://via.placeholder.com/50'],
    ['Mouse', 'piece', 'Electronics', 'Logitech', 50, 'In Stock', 'https://via.placeholder.com/50'],
    ['Keyboard', 'piece', 'Electronics', 'Corsair', 0, 'Out of Stock', 'https://via.placeholder.com/50'],
    ['Monitor', 'piece', 'Electronics', 'Samsung', 8, 'In Stock', 'https://via.placeholder.com/50'],
    ['Desk Chair', 'piece', 'Furniture', 'Herman Miller', 5, 'In Stock', 'https://via.placeholder.com/50']
  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO products (name, unit, category, brand, stock, status, image)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  sampleProducts.forEach(product => {
    insertStmt.run(product);
  });

  insertStmt.finalize();
}

module.exports = db;
