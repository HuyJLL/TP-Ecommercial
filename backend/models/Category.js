const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        unique: true // Tên danh mục không được trùng nhau
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);