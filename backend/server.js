const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // MỚI THÊM: Thư viện xử lý đường dẫn có sẵn của Node
const multer = require('multer'); // MỚI THÊM: Thư viện nhận file
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MỚI THÊM: Cấu hình Multer (Nơi lưu và Tên file)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Lưu vào thư mục uploads
    },
    filename: (req, file, cb) => {
        // Đổi tên file thành thời gian hiện tại để không bao giờ bị trùng tên
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage });

// MỚI THÊM: Tạo API riêng để Upload ảnh
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Không có file nào được tải lên!" });
    
    // Trả về đường link tới bức ảnh vừa lưu
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

// Kết nối DB và Route
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Đã kết nối thành công với MongoDB'))
  .catch((err) => console.log('❌ Lỗi kết nối MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});