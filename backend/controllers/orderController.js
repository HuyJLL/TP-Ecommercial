const Order = require('../models/Order');
const Product = require('../models/Product');
const Receipt = require('../models/Receipt'); // 1. Nhúng thêm Model Receipt vừa tạo

// [POST] /api/orders - Nhận yêu cầu đặt hàng và xuất hóa đơn
const createOrder = async (req, res) => {
    try {
        // Lấy thêm trường paymentMethod từ React gửi lên (nếu có)
        const { user, orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống, không thể đặt hàng!" });
        }

        // BƯỚC 1: Lưu đơn hàng mới vào cơ sở dữ liệu
        const order = new Order({
            user,
            orderItems,
            shippingAddress,
            totalPrice
        });
        const createdOrder = await order.save();

        // BƯỚC 2: Tự động sinh Hóa đơn (Receipt) đi kèm cho đơn hàng này
        // Tạo mã hóa đơn độc nhất bằng tiền tố HD kết hợp với timestamp (Ví dụ: HD-17184561234)
        const randomReceiptNumber = `HD-${Date.now()}`; 
        
        const receipt = new Receipt({
            order: createdOrder._id, // Gắn ID đơn hàng vừa tạo ở trên
            user: user,             // ID khách hàng mua
            receiptNumber: randomReceiptNumber,
            amountPaid: totalPrice, // Số tiền thực thu
            paymentMethod: paymentMethod || 'Tiền mặt', // Mặc định là tiền mặt nếu form không truyền
            status: 'Đã thanh toán' // Mặc định hóa đơn xuất ra là đã thu tiền
        });
        await receipt.save(); // Lưu hóa đơn xuống MongoDB

        // BƯỚC 3: Tự động trừ số lượng tồn kho của các sản phẩm được mua
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock = product.stock - item.quantity;
                await product.save(); // Lưu lại số lượng kho mới
            }
        }

        // Trả về phản hồi thành công kèm thông tin của cả đơn hàng và hóa đơn
        res.status(201).json({ 
            message: "🎉 Đặt hàng và xuất hóa đơn thành công!", 
            order: createdOrder,
            receipt: receipt
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi xử lý đơn hàng và hóa đơn", error: error.message });
    }
};

// [GET] /api/orders - Lấy danh sách toàn bộ đơn hàng (Dành cho Admin/Nhân viên)
const getAllOrders = async (req, res) => {
    try {
        // populate('user', 'email') giúp lấy thêm email của khách hàng dựa vào user ID
        const orders = await Order.find().populate('user', 'email').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tải danh sách đơn hàng", error: error.message });
    }
};

// [PUT] /api/orders/:id/status - Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            id, 
            { status }, 
            { returnDocument: 'after' }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
        }

        res.status(200).json({ message: "Cập nhật trạng thái thành công!", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật trạng thái đơn hàng", error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tải lịch sử đơn hàng", error: error.message });
    }
};

const orderController = { createOrder, getAllOrders, updateOrderStatus, getMyOrders };

module.exports = orderController;