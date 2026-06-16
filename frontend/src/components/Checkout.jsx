import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Checkout = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const [cart, setCart] = useState([]);
    const [shippingDetails, setShippingDetails] = useState({
        fullName: '', phone: '', address: ''
    });

    // State quản lý Pop-up thông báo công nghệ
    const [modal, setModal] = useState({ isOpen: false, message: '', shouldRedirect: false });

    useEffect(() => {
        // Nếu chưa đăng nhập, không cho vào trang này
        if (!user) {
            navigate('/login');
            return;
        }
        // Lấy giỏ hàng hiện tại
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (savedCart.length === 0) {
            navigate('/home'); // Giỏ hàng trống thì đẩy về trang chủ
        }
        setCart(savedCart);
    }, []);

    const handleChange = (e) => {
        setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Xử lý khi bấm nút "Xác Nhận Đặt Hàng"
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Đóng gói dữ liệu chuẩn theo cấu trúc Order Model ở backend
        const orderData = {
            user: user._id || user.id, // Sửa: Dùng _id để đảm bảo tương thích MongoDB
            orderItems: cart.map(item => ({
                product: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image
            })),
            shippingAddress: shippingDetails,
            totalPrice: calculateTotal()
        };

        try {
            const response = await api.post('/orders', orderData);
            
            // Xóa sạch giỏ hàng trong máy sau khi đặt thành công
            localStorage.removeItem('cart');
            
            // Phát tín hiệu làm mới số lượng giỏ hàng trên chấm đỏ Navbar
            window.dispatchEvent(new Event('cartUpdated'));

            // Hiển thị Pop-up báo thành công và đánh dấu cần chuyển trang
            setModal({
                isOpen: true,
                message: response.data.message + ' Đơn hàng của bạn đang chờ xác nhận.',
                shouldRedirect: true
            });

        } catch (error) {
            setModal({
                isOpen: true,
                message: 'Đặt hàng thất bại: ' + (error.response?.data?.message || 'Lỗi hệ thống'),
                shouldRedirect: false
            });
        }
    };

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.shouldRedirect) {
            navigate('/home'); // Quay về trang chủ mua sắm tiếp
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>💳 Thủ Tục Thanh Toán</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', marginTop: '20px' }}>
                
                {/* PHẦN ĐIỀN THÔNG TIN GIAO HÀNG */}
                <form onSubmit={handlePlaceOrder} style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0, color: '#34495e' }}>Thông Tin Nhận Hàng</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Họ và Tên người nhận *</label>
                            <input type="text" name="fullName" required value={shippingDetails.fullName} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="Nguyễn Văn A" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Số Điện Thoại *</label>
                            <input type="tel" name="phone" required value={shippingDetails.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="0901234567" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Địa Chỉ Giao Hàng *</label>
                            <textarea name="address" required value={shippingDetails.address} onChange={handleChange} rows="4" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'none' }} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." />
                        </div>
                    </div>
                    <button type="submit" style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                        🚀 XÁC NHẬN ĐẶT HÀNG
                    </button>
                </form>

                {/* PHẦN TÓM TẮT ĐƠN HÀNG */}
                <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', backgroundColor: '#fff', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, color: '#34495e', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Đơn Hàng Của Bạn</h3>
                    
                    <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '15px' }}>
                        {cart.map((item, index) => (
                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #eee' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40?text=Loi'; }} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{item.name}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#7f8c8d' }}>Số lượng: {item.quantity}</p>
                                    </div>
                                </div>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>{(item.price * item.quantity).toLocaleString()} đ</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '2px solid #eee' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Tổng tiền thanh toán:</span>
                        <strong style={{ color: '#e74c3c', fontSize: '22px' }}>{calculateTotal().toLocaleString()} đ</strong>
                    </div>
                </div>
            </div>

            {/* BẢNG POP-UP THÔNG BÁO */}
            {modal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>ℹ️ Thông Báo</h3>
                        <p style={{ margin: '20px 0', fontSize: '16px', color: '#333', linearHeight: '1.5' }}>{modal.message}</p>
                        <button onClick={closeModal} style={{ padding: '8px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;