const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

// Bất kỳ ai cũng lấy được danh sách, nhưng chỉ Admin/Nhân viên mới được tạo mới
router.get('/', categoryController.getCategories);
router.post('/', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), categoryController.createCategory);
router.put('/:id', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), categoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), categoryController.deleteCategory);

module.exports = router;