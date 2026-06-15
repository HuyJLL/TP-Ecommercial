const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true // Đảm bảo email không bị trùng
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'CUSTOMER' // Phân quyền cơ bản
    }
}, { timestamps: true }); // Tự động thêm ngày tạo/ngày cập nhật

module.exports = mongoose.model('User', userSchema);