const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController'); 
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authenticate, authorizeRole(['ADMIN']), authController.getAllUsers);
router.put('/users/:id/role', authenticate, authorizeRole(['ADMIN']), authController.updateUserRole); 

module.exports = router;