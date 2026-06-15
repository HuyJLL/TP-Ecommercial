const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware')

// Khai báo API tạo đơn hàng
router.post('/', authenticate, orderController.createOrder);
router.get('/', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), orderController.getAllOrders);
router.put('/:id/status', authenticate, authorizeRole(['ADMIN', 'EMPLOYEE']), orderController.updateOrderStatus);
router.get('/my-orders/:userId', authenticate, orderController.getMyOrders);
module.exports = router;