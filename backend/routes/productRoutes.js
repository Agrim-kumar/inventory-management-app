const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const upload = require('../middleware/uploadMiddleware');

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('status').isIn(['In Stock', 'Out of Stock']).withMessage('Invalid status')
];

// Routes
router.get('/products', productController.getAllProducts);
router.get('/products/search', productController.searchProducts);
router.get('/products/export', productController.exportProducts);
router.get('/products/:id', productController.getProductById);
router.get('/products/:id/history', productController.getInventoryHistory);
router.post('/products', productValidation, productController.createProduct);
router.post('/products/import', upload.single('csvFile'), productController.importProducts);
router.put('/products/:id', productValidation, productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
