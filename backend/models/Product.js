const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String 
    },
    image: { 
        type: String, // Lưu đường dẫn URL của hình ảnh
        default: 'https://via.placeholder.com/150'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category' // Liên kết với bảng Category
    },
    stock: { 
        type: Number, 
        required: true,
        default: 0 // Số lượng tồn kho
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);