import { useEffect, useState } from 'react';
import api from '../api';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, type: '', message: '', onConfirm: null });

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh mục", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const closeModal = () => setModal({ isOpen: false, type: '', message: '', onConfirm: null });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setModal({ isOpen: true, type: 'alert', message: 'Tên danh mục không được để trống!' });
            return;
        }

        try {
            if (isEditing) {
                await api.put(`/categories/${editId}`, formData);
                setModal({ isOpen: true, type: 'alert', message: 'Cập nhật danh mục thành công!' });
            } else {
                await api.post('/categories', formData);
                setModal({ isOpen: true, type: 'alert', message: 'Thêm danh mục mới thành công!' });
            }
            setFormData({ name: '' });
            setIsEditing(false);
            setEditId(null);
            fetchCategories();
        } catch (error) {
            setModal({
                isOpen: true,
                type: 'alert',
                message: error.response?.data?.message || 'Có lỗi xảy ra!'
            });
        }
    };

    const handleEdit = (category) => {
        setFormData({ name: category.name });
        setIsEditing(true);
        setEditId(category._id);
    };

    const handleDelete = (id) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            message: "Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.",
            onConfirm: async () => {
                closeModal();
                try {
                    await api.delete(`/categories/${id}`);
                    fetchCategories();
                    setModal({ isOpen: true, type: 'alert', message: 'Đã xóa danh mục thành công!' });
                } catch (error) {
                    setModal({
                        isOpen: true,
                        type: 'alert',
                        message: error.response?.data?.message || 'Lỗi khi xóa danh mục.'
                    });
                }
            }
        });
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            <h2>📚 Quản Lý Danh Mục Sản Phẩm</h2>
            
            <form onSubmit={handleSubmit} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input type="text" name="name" placeholder="Nhập tên danh mục..." value={formData.name} onChange={handleChange} required style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: isEditing ? '#f39c12' : '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{isEditing ? '💾 Lưu' : '➕ Thêm'}</button>
                    {isEditing && (<button type="button" onClick={() => { setIsEditing(false); setFormData({ name: '' }); setEditId(null); }} style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>)}
                </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <thead><tr style={{ backgroundColor: '#34495e', color: 'white' }}><th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Tên Danh Mục</th><th style={{ padding: '12px', border: '1px solid #ddd', width: '150px' }}>Hành Động</th></tr></thead>
                <tbody>
                    {categories.map(category => (<tr key={category._id} style={{ textAlign: 'center', backgroundColor: '#fff' }}><td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}><strong>{category.name}</strong></td><td style={{ border: '1px solid #ddd', padding: '10px' }}><button onClick={() => handleEdit(category)} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: '#f1c40f', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold' }}>Sửa</button><button onClick={() => handleDelete(category._id)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px', fontWeight: 'bold' }}>Xóa</button></td></tr>))}
                    {categories.length === 0 && (<tr><td colSpan="2" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>Chưa có danh mục nào.</td></tr>)}
                </tbody>
            </table>

            {modal.isOpen && (<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}><div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}><h3 style={{ marginTop: 0, color: '#2c3e50' }}>{modal.type === 'confirm' ? '⚠️ Xác Nhận' : 'ℹ️ Thông Báo'}</h3><p style={{ margin: '20px 0', fontSize: '16px', color: '#333' }}>{modal.message}</p><div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>{modal.type === 'confirm' ? (<><button onClick={modal.onConfirm} style={{ padding: '8px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đồng ý</button><button onClick={closeModal} style={{ padding: '8px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button></>) : (<button onClick={closeModal} style={{ padding: '8px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng</button>)}</div></div></div>)}
        </div>
    );
};

export default CategoryManagement;