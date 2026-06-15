const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// [POST] /api/auth/register
const register = async (req, res) => {
    try {
        // 1. Lấy thêm role từ req.body
        const { email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Thêm role vào object được lưu
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role || 'CUSTOMER' // Nếu không truyền lên thì mặc định là CUSTOMER
        });

        await newUser.save();
        res.status(201).json({ message: "Đăng ký tài khoản thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// [POST] /api/auth/login

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Không tìm thấy tài khoản với email này!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu không chính xác!" });
        }

        // --- BƯỚC NÂNG CẤP: TẠO TOKEN ---
        const token = jwt.sign(
            { id: user._id, role: user.role },   // Payload: thông tin gắn vào token
            'thanhphat_secret_key_2026',         // Khóa bí mật (phải trùng với bên middleware)
            { expiresIn: '1h' }                  // Token có hiệu lực trong 1 giờ
        );

        // --- BƯỚC NÂNG CẤP: TRẢ VỀ TOKEN ---
        res.status(200).json({
            message: "Đăng nhập thành công!",
            token: token, // Đây là "tấm thẻ bài" để client dùng cho các request sau
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Dùng .select('-password') để không trả về mật khẩu đã mã hóa
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

// [PUT] /api/auth/users/:id/role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID của user từ URL
        const { role } = req.body; // Lấy quyền mới từ React gửi lên

        // Cập nhật user theo ID
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { role: role }, 
            { returnDocument: 'after' } // Trả về thông tin user sau khi đã cập nhật
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng!" });
        }

        res.status(200).json({ message: "Cập nhật quyền thành công!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server", error: error.message });
    }
};

const authController = { register, login, getAllUsers, updateUserRole };
module.exports = authController;
