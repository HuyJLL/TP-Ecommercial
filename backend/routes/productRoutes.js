const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', productController.getProducts);
router.post('/', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), productController.createProduct);
router.put('/:id', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), productController.updateProduct);
router.delete('/:id', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), productController.deleteProduct);

module.exports = router;