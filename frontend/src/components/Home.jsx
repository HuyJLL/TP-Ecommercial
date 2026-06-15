import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    
    // State cho Pop-up thông báo
    const [modal, setModal] = useState({ isOpen: false, message: '' });

    // Lấy dữ liệu sản phẩm khi vừa vào trang
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                setProducts(response.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm", error);
            }
        };
        fetchProducts();
    }, []);

    // Hàm Xử lý thêm vào giỏ hàng
    const handleAddToCart = (product) => {
        if (!user) {
            setModal({ isOpen: true, message: 'Vui lòng đăng nhập để thêm hàng vào giỏ!' });
            return;
        }

        // Lấy giỏ hàng hiện tại từ localStorage (nếu có), nếu không thì tạo mảng rỗng
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Kiểm tra xem sản phẩm này đã có trong giỏ chưa
        const existingItemIndex = cart.findIndex(item => item._id === product._id);
        
        if (existingItemIndex !== -1) {
            // Nếu có rồi thì tăng số lượng lên 1
            cart[existingItemIndex].quantity += 1;
        } else {
            // Nếu chưa có thì thêm mới vào với số lượng là 1
            cart.push({ ...product, quantity: 1 });
        }

        // Lưu ngược lại vào máy
        localStorage.setItem('cart', JSON.stringify(cart));

        window.dispatchEvent(new Event('cartUpdated'));
        
        // Hiện pop-up báo thành công
        setModal({ isOpen: true, message: `🛒 Đã thêm "${product.name}" vào giỏ hàng!` });
    };

    const closeModal = () => {
        setModal({ isOpen: false, message: '' });
        // Nếu chưa đăng nhập mà đòi mua, đóng pop-up xong đẩy ra trang login
        if (!user && modal.message.includes('đăng nhập')) {
            navigate('/login');
        }
    };

    // Lấy danh sách các danh mục độc nhất từ sản phẩm hiện có
    // Sửa lại: lấy p.category?.name vì category giờ là một Object
    const categories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

    // Xử lý Lọc & Sắp xếp sản phẩm
    let filteredProducts = products.filter(product => {
        const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = selectedCategory ? product.category?.name === selectedCategory : true;
        return matchSearch && matchCategory;
    });

    if (sortOrder === 'asc') {
        filteredProducts.sort((a, b) => a.price - b.price); // Thấp đến cao
    } else if (sortOrder === 'desc') {
        filteredProducts.sort((a, b) => b.price - a.price); // Cao đến thấp
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* KHU VỰC THÔNG TIN NHÂN VIÊN / ADMIN (Giữ lại từ phiên bản trước) */}
            {user && user.role !== 'CUSTOMER' && (
                <div style={{ 
                    backgroundColor: user.role === 'ADMIN' ? '#f8d7da' : '#d1ecf1', 
                    padding: '15px', borderRadius: '5px', marginBottom: '30px' 
                }}>
                    <h3>{user.role === 'ADMIN' ? '🔧 Bảng Điều Khiển Admin' : '📦 Khu Vực Làm Việc Của Nhân Viên'}</h3>
                    <p>Chào mừng bạn trở lại, hệ thống ghi nhận quyền truy cập nội bộ.</p>
                </div>
            )}

            {/* KHU VỰC TRƯNG BÀY SẢN PHẨM */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: '#2c3e50', fontSize: '28px' }}>SẢN PHẨM NỔI BẬT</h2>
                <p style={{ color: '#7f8c8d' }}>Khám phá các mặt hàng công nghệ mới nhất</p>
            </div>

            {/* KHU VỰC TÌM KIẾM VÀ BỘ LỌC */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Tìm kiếm tên sản phẩm..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                        padding: '12px 20px', 
                        width: '100%', 
                        maxWidth: '400px', 
                        borderRadius: '25px', 
                        border: '1px solid #bdc3c7',
                        fontSize: '16px',
                        outline: 'none',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                />
                
                {/* Bộ lọc Danh mục */}
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ padding: '12px 20px', borderRadius: '25px', border: '1px solid #bdc3c7', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="">🛒 Tất cả danh mục</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Sắp xếp Giá */}
                <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ padding: '12px 20px', borderRadius: '25px', border: '1px solid #bdc3c7', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="">⚡ Sắp xếp: Mặc định</option>
                    <option value="asc">📈 Giá: Thấp đến Cao</option>
                    <option value="desc">📉 Giá: Cao đến Thấp</option>
                </select>
            </div>

            {/* Tạo layout dạng lưới (Grid) để chứa các Card sản phẩm */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '25px' 
            }}>
                {filteredProducts.map(product => (
                    <div key={product._id} style={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #eee', 
                        borderRadius: '8px', 
                        padding: '15px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s' // Hiệu ứng khi hover
                    }}>
                        {/* Ảnh sản phẩm */}
                        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <img 
                                src={product.image} 
                                alt={product.name} 
                                style={{ width: '100%', height: '180px', objectFit: 'contain' }}
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150?text=Loi+Anh'; }}
                            />
                        </div>

                        {/* Thông tin */}
                        <div>
                            <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', lineHeight: '1.4' }}>
                                {product.name}
                            </h4>
                            <p style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '20px', margin: '0 0 10px 0' }}>
                                {product.price.toLocaleString()} VNĐ
                            </p>
                            <p style={{ color: '#7f8c8d', fontSize: '13px', margin: '0 0 15px 0', height: '40px', overflow: 'hidden' }}>
                                {product.description || 'Chưa có mô tả cho sản phẩm này.'}
                            </p>
                            
                            {/* Trạng thái tồn kho */}
                            {product.stock > 0 ? (
                                <p style={{ color: '#27ae60', fontSize: '13px', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                                    ✓ Còn hàng ({product.stock})
                                </p>
                            ) : (
                                <p style={{ color: '#e74c3c', fontSize: '13px', margin: '0 0 15px 0', fontWeight: 'bold' }}>
                                    ✕ Hết hàng
                                </p>
                            )}
                        </div>

                        {/* Nút Thêm vào giỏ */}
                        <button 
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0} // Khóa nút nếu hết hàng
                            style={{ 
                                width: '100%', 
                                padding: '10px', 
                                backgroundColor: product.stock > 0 ? '#3498db' : '#95a5a6', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: product.stock > 0 ? 'pointer' : 'not-allowed', 
                                fontWeight: 'bold',
                                fontSize: '15px'
                            }}
                        >
                            {product.stock > 0 ? 'Thêm Vào Giỏ Hàng' : 'Tạm Hết Hàng'}
                        </button>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#7f8c8d' }}>
                        <h3>Không tìm thấy sản phẩm nào.</h3>
                    </div>
                )}
            </div>

            {/* GIAO DIỆN BẢNG POP-UP (MODAL) */}
            {modal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '25px', borderRadius: '8px',
                        width: '350px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>ℹ️ Thông Báo</h3>
                        <p style={{ margin: '20px 0', fontSize: '16px', color: '#333' }}>{modal.message}</p>
                        <button onClick={closeModal} style={{ padding: '8px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đóng</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;