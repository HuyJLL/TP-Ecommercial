import { useEffect, useState } from 'react';
import api from '../api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    // 1. Khởi tạo State quản lý Pop-up (Modal)
    const [modal, setModal] = useState({
        isOpen: false,
        type: '', // Nhận 2 giá trị: 'confirm' (hỏi xác nhận) hoặc 'alert' (báo kết quả)
        message: '',
        onConfirm: null // Hàm sẽ chạy nếu người dùng bấm "Đồng ý"
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/auth/users');
                setUsers(response.data);
            } catch (err) {
                setError('Không thể tải danh sách người dùng. Bạn không có quyền truy cập.');
            }
        };
        fetchUsers();
    }, []);

    // 2. Viết lại hàm xử lý đổi quyền
    const handleRoleChange = (userId, newRole) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            message: `Bạn có chắc chắn muốn đổi quyền thành ${newRole}?`,
            onConfirm: async () => {
                closeModal();
                try {
                    const response = await api.put(`/auth/users/${userId}/role`, { role: newRole });
                    
                    setUsers(users.map(user => 
                        user._id === userId ? { ...user, role: newRole } : user
                    ));

                    setModal({ isOpen: true, type: 'alert', message: response.data.message });
                } catch (err) {
                    setModal({
                        isOpen: true,
                        type: 'alert',
                        message: 'Lỗi: ' + (err.response?.data?.message || 'Bạn không có quyền này!')
                    });
                }
            }
        });
    };

    // Hàm tiện ích để đóng Modal
    const closeModal = () => {
        setModal({ isOpen: false, type: '', message: '', onConfirm: null });
    };

    return (
        // Thêm position: 'relative' để làm mốc cho Pop-up hiển thị đè lên
        <div style={{ fontFamily: 'sans-serif', position: 'relative' }}> 
            <h2>Quản Lý Người Dùng</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>ID</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Email</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Phân Quyền</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ngày Tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id} style={{ textAlign: 'center', backgroundColor: '#fff' }}>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user._id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', fontWeight: '500' }}>{user.email}</td>
                            
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                <select 
                                    value={user.role} 
                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    style={{ 
                                        padding: '5px', borderRadius: '4px', fontWeight: 'bold',
                                        color: user.role === 'ADMIN' ? '#e74c3c' : user.role === 'EMPLOYEE' ? '#2980b9' : '#27ae60',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="CUSTOMER">CUSTOMER</option>
                                    <option value="EMPLOYEE">EMPLOYEE</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </td>
                            
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 3. GIAO DIỆN BẢNG POP-UP (MODAL) */}
            {modal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', // Lớp phủ đen mờ
                    display: 'flex', justifyContent: 'center', alignItems: 'center', 
                    zIndex: 1000 // Nổi lên trên cùng
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
                            {/* Logic hiển thị nút bấm tùy theo loại Pop-up */}
                            {modal.type === 'confirm' ? (
                                <>
                                    <button 
                                        onClick={modal.onConfirm}
                                        style={{ padding: '8px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Đồng ý
                                    </button>
                                    <button 
                                        onClick={closeModal}
                                        style={{ padding: '8px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Hủy
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={closeModal}
                                    style={{ padding: '8px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Đóng
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;