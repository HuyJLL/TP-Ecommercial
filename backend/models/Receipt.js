const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
    // 1. Liên kết với Đơn hàng nào
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    // 2. Liên kết với Khách hàng thanh toán
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 3. Mã hóa đơn (Dùng để in ra giấy hoặc gửi email)
    receiptNumber: {
        type: String,
        required: true,
        unique: true
    },
    // 4. Số tiền thực tế đã thu
    amountPaid: {
        type: Number,
        required: true
    },
    // 5. Phương thức thanh toán
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Tiền mặt', 'Chuyển khoản ngân hàng', 'Ví điện tử', 'Quẹt thẻ'],
        default: 'Tiền mặt'
    },
    // 6. Trạng thái biên lai
    status: {
        type: String,
        required: true,
        enum: ['Chờ thanh toán', 'Đã thanh toán', 'Đã hoàn tiền'],
        default: 'Đã thanh toán'
    },
    // 7. Ghi chú thêm (nếu có)
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true }); // Tự động có createdAt làm ngày xuất hóa đơn

module.exports = mongoose.model('Receipt', receiptSchema);