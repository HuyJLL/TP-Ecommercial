import { useEffect, useState } from 'react';
import api from '../api'; // Chỉ dùng api, KHÔNG import axios nữa

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // MỚI: Danh sách danh mục lấy từ API
    const [formData, setFormData] = useState({
      name: '', price: '', description: '', image: '', stock: '', category: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // 1. Khởi tạo State quản lý Pop-up (Modal)
    const [modal, setModal] = useState({
        isOpen: false,
        type: '', // 'confirm' (hỏi xác nhận) hoặc 'alert' (báo kết quả)
        message: '',
        onConfirm: null 
    });

    // Hàm tiện ích để đóng Modal
    const closeModal = () => {
        setModal({ isOpen: false, type: '', message: '', onConfirm: null });
    };

    const fetchProducts = async () => {
        try {
            // Thay axios.get thành api.get và rút gọn link
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Lỗi khi tải sản phẩm", error);
        }
    };

    // Hàm lấy danh sách danh mục
    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Xử lý Upload Ảnh với Pop-up
    const handleImageUpload = async (e) => {
        const file = e.target.files[0]; 
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            // Thay axios.post thành api.post
            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            
            setFormData({ ...formData, image: response.data.imageUrl });
            setModal({ isOpen: true, type: 'alert', message: 'Tải ảnh lên thành công!' });
        } catch (error) {
            console.error(error);
            setModal({ isOpen: true, type: 'alert', message: 'Lỗi tải ảnh. Vui lòng thử lại!' });
        }
    };

    // Xử lý Thêm/Sửa Sản phẩm với Pop-up
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Thay axios.put thành api.put
                await api.put(`/products/${editId}`, formData);
                setModal({ isOpen: true, type: 'alert', message: 'Cập nhật sản phẩm thành công!' });
            } else {
                // Thay axios.post thành api.post
                await api.post('/products', formData);
                setModal({ isOpen: true, type: 'alert', message: 'Thêm sản phẩm mới thành công!' });
            }
            
            setFormData({ name: '', price: '', description: '', image: '', stock: '', category: '' });
            setIsEditing(false);
            setEditId(null);
            fetchProducts();
        } catch (error) {
            // Hiển thị chi tiết lỗi từ Backend nếu có, hoặc báo chung chung
            setModal({ 
                isOpen: true, 
                type: 'alert', 
                message: error.response?.data?.message || 'Có lỗi xảy ra, bạn không có quyền hoặc server lỗi!' 
            });
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image,
            stock: product.stock,
            category: product.category?._id || '' // Lấy _id của danh mục
        });
        setIsEditing(true);
        setEditId(product._id);
    };

    // Xử lý Xóa Sản phẩm với Pop-up Xác nhận
    const handleDelete = (id) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            message: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi kho?",
            onConfirm: async () => {
                closeModal(); // Đóng pop-up xác nhận
                try {
                    // Thay axios.delete thành api.delete
                    await api.delete(`/products/${id}`);
                    fetchProducts(); 
                    setModal({ isOpen: true, type: 'alert', message: 'Đã xóa sản phẩm thành công!' });
                } catch (error) {
                    setModal({ 
                        isOpen: true, 
                        type: 'alert', 
                        message: error.response?.data?.message || 'Lỗi khi xóa sản phẩm. Bạn có thể không đủ quyền!' 
                    });
                }
            }
        });
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <h2>📦 Quản Lý Kho Sản Phẩm</h2>
            
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <input type="text" name="name" placeholder="Tên sản phẩm *" value={formData.name} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="number" name="price" placeholder="Giá bán (VNĐ) *" value={formData.price} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <input type="number" name="stock" placeholder="Số lượng tồn kho *" value={formData.stock} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <select name="category" value={formData.category} onChange={handleChange} required style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="">-- Chọn danh mục --</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                    <input type="text" name="description" placeholder="Mô tả ngắn gọn" value={formData.description} onChange={handleChange} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    
                    <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label style={{ fontWeight: 'bold', color: '#2c3e50' }}>Hình ảnh sản phẩm:</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ padding: '5px' }} />
                    </div>

                    {formData.image && (
                        <div style={{ gridColumn: 'span 2', textAlign: 'center', marginTop: '10px', padding: '10px', backgroundColor: '#fff', border: '1px dashed #bdc3c7', borderRadius: '4px' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#7f8c8d' }}></p>
                            <img src={formData.image} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain', borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150?text=Loi+Load+Anh'; }} />
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '20px' }}>
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: isEditing ? '#f39c12' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isEditing ? '💾 Lưu Thay Đổi' : '➕ Thêm Sản Phẩm Mới'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={() => { setIsEditing(false); setFormData({ name: '', price: '', description: '', image: '', stock: '', category: '' }); }} style={{ marginLeft: '10px', padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Hủy Sửa
                        </button>
                    )}
                </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ảnh</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tên</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Danh Mục</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Giá</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tồn Kho</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product._id} style={{ textAlign: 'center', backgroundColor: '#fff' }}>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50?text=Loi'; }}/>
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}><strong>{product.name}</strong></td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', color: '#8e44ad', fontWeight: 'bold' }}>{product.category?.name || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', color: '#e74c3c', fontWeight: 'bold' }}>{product.price.toLocaleString()} đ</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{product.stock}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                <button onClick={() => handleEdit(product)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold' }}>Sửa</button>
                                <button onClick={() => handleDelete(product._id)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>Kho hiện đang trống.</td></tr>
                    )}
                </tbody>
            </table>

            {/* 2. GIAO DIỆN BẢNG POP-UP (MODAL) */}
            {modal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '25px', borderRadius: '8px',
                        width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>
                            {modal.type === 'confirm' ? '⚠️ Xác Nhận' : 'ℹ️ Thông Báo'}
                        </h3>
                        <p style={{ margin: '20px 0', fontSize: '16px', color: '#333' }}>
                            {modal.message}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            {modal.type === 'confirm' ? (
                                <>
                                    <button onClick={modal.onConfirm} style={{ padding: '8px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đồng ý</button>
                                    <button onClick={closeModal} style={{ padding: '8px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
                                </>
                            ) : (
                                <button onClick={closeModal} style={{ padding: '8px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;