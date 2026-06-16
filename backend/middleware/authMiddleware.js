const jwt = require('jsonwebtoken');

// Thay chuỗi này bằng một mã bí mật của riêng bạn (nên lưu trong file .env)
const JWT_SECRET = 'thanhphat_secret_key_2026'; 

const authMiddleware = {
    // 1. Kiểm tra xem user đã đăng nhập chưa
    authenticate: (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ Bearer Token

        if (!token) return res.status(401).json({ message: "Chưa đăng nhập!" });

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // Lưu thông tin user vào req để dùng sau
            next();
        } catch (error) {
            res.status(403).json({ message: "Token không hợp lệ!" });
        }
    },

    // 2. Kiểm tra quyền hạn (Admin, Employee...)
    authorizeRole: (roles = []) => {
        return (req, res, next) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
            }
            next();
        };
    }
};

module.exports = authMiddleware;