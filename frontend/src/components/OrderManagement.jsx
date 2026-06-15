import { useEffect, useState } from 'react';
import api from '../api';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [modal, setModal] = useState({ isOpen: false, type: '', message: '', onConfirm: null });

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const closeModal = () => setModal({ isOpen: false, type: '', message: '', onConfirm: null });

    // Hàm gọi API khi Nhân viên/Admin chọn trạng thái mới từ Dropdown
    const handleStatusChange = (orderId, newStatus) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            message: `Xác nhận chuyển trạng thái đơn hàng thành "${newStatus}"?`,
            onConfirm: async () => {
                closeModal();
                try {
                    const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
                    
                    // Cập nhật lại state để giao diện đổi ngay lập tức
                    setOrders(orders.map(order => 
                        order._id === orderId ? { ...order, status: newStatus } : order
                    ));
                    
                    setModal({ isOpen: true, type: 'alert', message: response.data.message });
                } catch (error) {
                    setModal({ isOpen: true, type: 'alert', message: 'Lỗi cập nhật: ' + (error.response?.data?.message || 'Không xác định') });
                }
            }
        });
    };

    // Hàm tiện ích chọn màu sắc cho Status
    const getStatusColor = (status) => {
        switch (status) {
            case 'Chờ xác nhận': return '#f39c12'; // Vàng cam
            case 'Đang xử lý': return '#3498db'; // Xanh dương
            case 'Đang giao hàng': return '#9b59b6'; // Tím
            case 'Đã giao': return '#27ae60'; // Xanh lá
            case 'Đã hủy': return '#e74c3c'; // Đỏ
            default: return '#333';
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <h2>📋 Quản Lý Đơn Hàng</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Khách Hàng & Giao Hàng</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd', width: '30%' }}>Chi Tiết Đơn</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Tổng Tiền</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Trạng Thái</th>
                        <th style={{ padding: '12px', border: '1px solid #ddd' }}>Ngày Đặt</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order._id} style={{ backgroundColor: '#fff', verticalAlign: 'top' }}>
                            {/* Cột 1: Thông tin liên hệ */}
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{order.shippingAddress.fullName}</p>
                                <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>📞 {order.shippingAddress.phone}</p>
                                <p style={{ margin: '0 0 5px 0', fontSize: '13px' }}>📧 {order.user?.email || 'N/A'}</p>
                                <p style={{ margin: '0', fontSize: '13px', color: '#7f8c8d' }}>📍 {order.shippingAddress.address}</p>
                            </td>
                            
                            {/* Cột 2: Các món hàng */}
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                <ul style={{ paddingLeft: '15px', margin: 0, fontSize: '13px' }}>
                                    {order.orderItems.map((item, index) => (
                                        <li key={index} style={{ marginBottom: '5px' }}>
                                            <strong>{item.name}</strong> (x{item.quantity}) 
                                            <br/>
                                            <span style={{ color: '#7f8c8d' }}>Đơn giá: {item.price.toLocaleString()} đ</span>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            
                            {/* Cột 3: Tổng tiền */}
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>
                                {order.totalPrice.toLocaleString()} đ
                            </td>
                            
                            {/* Cột 4: Chuyển đổi trạng thái */}
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                <select 
                                    value={order.status} 
                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                    style={{ 
                                        padding: '6px', 
                                        borderRadius: '4px', 
                                        fontWeight: 'bold',
                                        color: 'white',
                                        backgroundColor: getStatusColor(order.status),
                                        border: 'none',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        width: '100%'
                                    }}
                                >
                                    <option value="Chờ xác nhận" style={{ backgroundColor: 'white', color: 'black' }}>Chờ xác nhận</option>
                                    <option value="Đang xử lý" style={{ backgroundColor: 'white', color: 'black' }}>Đang xử lý</option>
                                    <option value="Đang giao hàng" style={{ backgroundColor: 'white', color: 'black' }}>Đang giao hàng</option>
                                    <option value="Đã giao" style={{ backgroundColor: 'white', color: 'black' }}>Đã giao</option>
                                    <option value="Đã hủy" style={{ backgroundColor: 'white', color: 'black' }}>Đã hủy</option>
                                </select>
                            </td>
                            
                            {/* Cột 5: Ngày giờ */}
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', fontSize: '13px' }}>
                                {new Date(order.createdAt).toLocaleString('vi-VN')}
                            </td>
                        </tr>
                    ))}
                    {orders.length === 0 && (
                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>Chưa có đơn hàng nào trong hệ thống.</td></tr>
                    )}
                </tbody>
            </table>

            {/* BẢNG POP-UP (MODAL) */}
            {modal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{modal.type === 'confirm' ? '⚠️ Xác Nhận' : 'ℹ️ Thông Báo'}</h3>
                        <p style={{ margin: '20px 0', fontSize: '16px', color: '#333' }}>{modal.message}</p>
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

export default OrderManagement;