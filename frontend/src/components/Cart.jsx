import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    // State cho Pop-up
    const [modal, setModal] = useState({ isOpen: false, type: '', message: '', onConfirm: null });

    // Lấy giỏ hàng từ máy khi vừa vào trang
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCart(savedCart);
    }, []);

    // Hàm tiện ích để cập nhật cả State lẫn LocalStorage
    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        
        // THÊM DÒNG NÀY: Báo cho Navbar cập nhật lại số lượng khi khách Tăng/Giảm/Xóa
        window.dispatchEvent(new Event('cartUpdated')); 
    };

    const closeModal = () => setModal({ isOpen: false, type: '', message: '', onConfirm: null });

    // Tăng số lượng
    const handleIncrease = (index) => {
        const newCart = [...cart];
        // Kiểm tra xem khách mua có vượt quá số lượng tồn kho không
        if (newCart[index].quantity < newCart[index].stock) {
            newCart[index].quantity += 1;
            updateCart(newCart);
        } else {
            setModal({ isOpen: true, type: 'alert', message: 'Vượt quá số lượng tồn kho của cửa hàng!' });
        }
    };

    // Giảm số lượng
    const handleDecrease = (index) => {
        const newCart = [...cart];
        if (newCart[index].quantity > 1) {
            newCart[index].quantity -= 1;
            updateCart(newCart);
        }
    };

    // Xóa sản phẩm khỏi giỏ
    const handleRemove = (index) => {
        setModal({
            isOpen: true,
            type: 'confirm',
            message: 'Bạn có chắc chắn muốn bỏ sản phẩm này khỏi giỏ hàng?',
            onConfirm: () => {
                const newCart = cart.filter((_, i) => i !== index);
                updateCart(newCart);
                closeModal();
            }
        });
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>🛒 Giỏ Hàng Của Bạn</h2>

            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginTop: '20px' }}>
                    <h3 style={{ color: '#7f8c8d' }}>Giỏ hàng đang trống</h3>
                    <button 
                        onClick={() => navigate('/home')} 
                        style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Tiếp Tục Mua Sắm
                    </button>
                </div>
            ) : (
                <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                                <th style={{ padding: '15px', borderBottom: '1px solid #ddd', textAlign: 'left' }}>Sản Phẩm</th>
                                <th style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>Đơn Giá</th>
                                <th style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>Số Lượng</th>
                                <th style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>Thành Tiền</th>
                                <th style={{ padding: '15px', borderBottom: '1px solid #ddd' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index} style={{ backgroundColor: '#fff', borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60?text=Loi'; }}/>
                                        <strong>{item.name}</strong>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d' }}>
                                        {item.price.toLocaleString()} đ
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                                            <button onClick={() => handleDecrease(index)} style={{ padding: '5px 10px', backgroundColor: '#f9f9f9', border: 'none', borderRight: '1px solid #ccc', cursor: 'pointer' }}>-</button>
                                            <span style={{ padding: '0 15px', fontWeight: 'bold' }}>{item.quantity}</span>
                                            <button onClick={() => handleIncrease(index)} style={{ padding: '5px 10px', backgroundColor: '#f9f9f9', border: 'none', borderLeft: '1px solid #ccc', cursor: 'pointer' }}>+</button>
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>
                                        {(item.price * item.quantity).toLocaleString()} đ
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'center' }}>
                                        <button onClick={() => handleRemove(index)} style={{ padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px' }}>
                                <span>Tổng cộng:</span>
                                <strong style={{ color: '#e74c3c', fontSize: '22px' }}>{calculateTotal().toLocaleString()} VNĐ</strong>
                            </div>
                            <button 
                                onClick={() => navigate('/checkout')} // Thay đổi dòng này
                                style={{ width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                TIẾN HÀNH ĐẶT HÀNG
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* BẢNG POP-UP (MODAL) */}
            {modal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{modal.type === 'confirm' ? '⚠️ Xác Nhận' : 'ℹ️ Thông Báo'}</h3>
                        <p style={{ margin: '20px 0', fontSize: '16px', color: '#333' }}>{modal.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                            {modal.type === 'confirm' ? (
                                <>
                                    <button onClick={modal.onConfirm} style={{ padding: '8px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đồng ý</button>
                                    <button onClick={closeModal} style={{ padding: '8px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
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

export default Cart;