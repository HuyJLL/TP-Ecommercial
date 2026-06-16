import { useEffect, useState } from 'react';
import api from '../api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchMyOrders = async () => {
            if (!user) return; // Bảo vệ: tránh lỗi khi user null
            try {
                const response = await api.get(`/orders/my-orders/${user._id || user.id}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi tải lịch sử đơn hàng", error);
            }
        };
        if (user) fetchMyOrders();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>📜 Lịch Sử Mua Hàng</h2>
            {orders.length === 0 ? <p>Bạn chưa có đơn hàng nào.</p> : (
                orders.map(order => (
                    <div key={order._id} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <strong>Đơn hàng: {order._id.slice(-8).toUpperCase()}</strong>
                            <span style={{ color: order.status === 'Đã giao' ? 'green' : 'orange', fontWeight: 'bold' }}>
                                {order.status}
                            </span>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            {order.orderItems.map((item, i) => (
                                <p key={i} style={{ margin: '5px 0' }}>• {item.name} x {item.quantity}</p>
                            ))}
                        </div>
                        <p style={{ fontWeight: 'bold', color: '#e74c3c' }}>Tổng tiền: {order.totalPrice.toLocaleString()} đ</p>
                    </div>
                ))
            )}
        </div>
    );
};
export default OrderHistory;