const mongoose = require('mongoose');

// Định nghĩa cấu trúc cho từng món hàng nằm bên trong đơn hàng
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Liên kết với bảng Product
        required: true
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String }
});

// Định nghĩa cấu trúc của toàn bộ Đơn hàng
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Liên kết với bảng User để biết ai là người đặt
        required: true
    },
    orderItems: [orderItemSchema], // Mảng chứa các món hàng khách đã chọn
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true }
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        required: true,
        // Dùng enum để chỉ cho phép lưu 1 trong 5 trạng thái này
        enum: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Đã giao', 'Đã hủy'],
        default: 'Chờ xác nhận'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);