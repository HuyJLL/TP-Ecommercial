const Product = require('../models/Product');

// [GET] /api/products - Lấy danh sách toàn bộ sản phẩm
const getProducts = async (req, res) => {
    try {
        // Dùng populate để kéo thêm trường 'name' từ bảng Category lên 
        const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 }); 
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải danh sách sản phẩm", error: error.message });
    }
};

// [POST] /api/products - Thêm sản phẩm mới
const createProduct = async (req, res) => {
    try {
        // Sửa: Lấy thêm trường 'category' từ request body
        const { name, price, description, image, stock, category } = req.body;
        // Sửa: Thêm 'category' vào đối tượng sản phẩm mới
        const newProduct = new Product({ name, price, description, image, stock, category });
        await newProduct.save();
        const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name');
        res.status(201).json({ message: "Đã thêm sản phẩm vào kho!", product: populatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm sản phẩm", error: error.message });
    }
};

// [PUT] /api/products/:id - Cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { returnDocument: 'after' })
                                           .populate('category', 'name');
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }
        res.status(200).json({ message: "Cập nhật thành công!", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật sản phẩm", error: error.message });
    }
};

// [DELETE] /api/products/:id - Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }
        res.status(200).json({ message: "Đã xóa sản phẩm khỏi hệ thống!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa sản phẩm", error: error.message });
    }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };