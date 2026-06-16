const Category = require('../models/Category');
const Product = require('../models/Product'); // Nâng cao: Dùng để kiểm tra trước khi xóa

// [GET] /api/categories - Lấy tất cả danh mục
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Lỗi tải danh mục", error: error.message });
    }
};

// [POST] /api/categories - Thêm danh mục mới
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const newCategory = new Category({ name });
        await newCategory.save();
        
        res.status(201).json({ message: "Đã thêm danh mục mới!", category: newCategory });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Tên danh mục này đã tồn tại!" });
        }
        res.status(500).json({ message: "Lỗi thêm danh mục", error: error.message });
    }
};

// [PUT] /api/categories/:id - Cập nhật danh mục
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { returnDocument: 'after' });
        if (!updatedCategory) {
            return res.status(404).json({ message: "Không tìm thấy danh mục!" });
        }
        res.status(200).json({ message: "Cập nhật thành công!", category: updatedCategory });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Tên danh mục này đã tồn tại!" });
        }
        res.status(500).json({ message: "Lỗi cập nhật danh mục", error: error.message });
    }
};

// [DELETE] /api/categories/:id - Xóa danh mục
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Nâng cao: Kiểm tra xem có sản phẩm nào đang dùng danh mục này không
        const productInUse = await Product.findOne({ category: id });
        if (productInUse) {
            return res.status(400).json({ message: "Không thể xóa, danh mục đang được sản phẩm sử dụng!" });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Không tìm thấy danh mục!" });
        }
        res.status(200).json({ message: "Đã xóa danh mục thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa danh mục", error: error.message });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };