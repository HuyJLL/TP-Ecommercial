import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css'; // Import file CSS mới tạo ở đây

const Navbar = () => {
    const navigate = useNavigate();
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const [cartCount, setCartCount] = useState(0);

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
    };

    useEffect(() => {
        updateCartCount(); 
        window.addEventListener('cartUpdated', updateCartCount);
        return () => window.removeEventListener('cartUpdated', updateCartCount);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className={styles.techNavbar}>
            <div>
                <Link to="/home" className={styles.logoLink}>
                    Thanh Phát Store
                </Link>
            </div>

            <div className={styles.menuContainer}>
                {user ? (
                    <>
                        <Link to="/home" className={styles.navLink}>Trang Chủ</Link>
                        {(user.role === 'ADMIN' || user.role === 'EMPLOYEE') && (
                         <>
                             {user.role === 'ADMIN' && (
                                 <Link to="/admin/users" className={styles.navLink}>Quản Lý Người Dùng</Link>
                             )}
                             <Link to="/admin/products" className={styles.navLink}>Quản Lý Kho</Link>
                             <Link to="/admin/categories" className={styles.navLink}>Quản Lý Danh Mục</Link>
                             <Link to="/admin/orders" className={styles.navLink}>Quản Lý Đơn Hàng</Link>
                         </>
                     )}
                        {user.role === 'CUSTOMER' && (
                            <Link to="/my-orders" className={styles.navLink}>Lịch Sử Đơn Hàng</Link>
                        )}
                        <span className={styles.divider}></span>
                        
                        <div className={styles.userInfoSection}>
                            <span className={styles.userEmail}>
                                <span className={styles.statusDot}></span>
                                {user.email.split('@')[0]}
                            </span>
                            <Link to="/cart" className={`${styles.navLink} ${styles.cartLink}`} style={{ position: 'relative' }}>
                            <span style={{ fontSize: '18px' }}>🛒</span> Giỏ Hàng
                            {cartCount > 0 && (
                                <span key={cartCount} className={styles.badgePop}>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                            <button onClick={handleLogout} className={styles.btnLogout}>
                                Đăng Xuất
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={styles.navLink}>Đăng Nhập</Link>
                        <Link to="/register" className={`${styles.navLink} ${styles.btnRegister}`}>Đăng Ký</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;