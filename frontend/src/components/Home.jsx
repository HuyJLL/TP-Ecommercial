import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const [products, setProducts] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [loading, setLoading] = useState(true);
    
    // State cho Pop-up thông báo
    const [modal, setModal] = useState({ isOpen: false, message: '' });

    // Lấy dữ liệu sản phẩm khi vừa vào trang
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsResponse, categoriesResponse] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);
                setProducts(productsResponse.data || []);
                setCategoriesData(categoriesResponse.data || []);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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

    // Lấy danh sách các danh mục từ backend nếu có, nếu không thì dùng dữ liệu sản phẩm
    const categories = categoriesData.length > 0
        ? categoriesData.map(category => category.name)
        : [...new Set(products.map(p => p.category?.name).filter(Boolean))];

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

    const heroCategories = categoriesData.length > 0 ? categoriesData.slice(0, 4) : [
        { name: 'Laptop' },
        { name: 'Sản phẩm Apple' },
        { name: 'Gaming Gear' },
        { name: 'Phụ kiện máy tính' }
    ];

    const promoCategories = categoriesData.length > 0 ? categoriesData.map(category => category.name) : [
        'Laptop',
        'Sản phẩm Apple',
        'Điện máy',
        'Điện gia dụng',
        'PC - Máy tính bàn',
        'Màn hình máy tính',
        'Linh kiện máy tính',
        'Phụ kiện máy tính',
        'Gaming Gear',
        'Điện thoại, Tablet',
        'Thiết bị âm thanh',
        'Thiết bị văn phòng',
    ];

    const bannerCards = [
        { title: 'Build PC', detail: 'Giảm thêm 2 triệu', color: '#ffb81c' },
        { title: 'Laptop Gaming RTX 4050', detail: 'Chỉ từ 24,990 triệu', color: '#ff6f00' },
        { title: 'iPhone 17 Pro Max', detail: 'Chỉ từ 35,990 triệu', color: '#00a8ff' },
        { title: 'Màn hình OLED', detail: 'Giá chỉ từ 12 triệu', color: '#3cd070' },
    ];

    return (
        <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', backgroundColor: '#f5f8ff', color: '#1f2d3d' }}>
            <div style={{ backgroundColor: '#0d3b76', color: '#ffffff', fontSize: '13px', padding: '10px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '0 16px' }}>
                    <span>Hệ thống Showroom</span>
                    <span>·</span>
                    <span>Dành Cho Doanh Nghiệp</span>
                    <span>·</span>
                    <span>Apple Education</span>
                    <span>·</span>
                    <span>Hotline: <strong>1800 6867</strong></span>
                    <span>·</span>
                    <span>Tin công nghệ</span>
                    <span>·</span>
                    <span>Xây dựng cấu hình</span>
                    <span>·</span>
                    <span>Khuyến mãi</span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '20px', alignItems: 'start', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 18px 50px rgba(24, 70, 119, 0.08)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid #eef2fa', fontSize: '16px', fontWeight: 700, color: '#12263f' }}>
                            Danh mục sản phẩm
                        </div>
                        <ul style={{ listStyle: 'none', margin: 0, padding: '14px 0' }}>
                            {promoCategories.map((category, index) => (
                                <li key={index} style={{ padding: '10px 22px', borderBottom: index < promoCategories.length - 1 ? '1px solid #f1f5fb' : 'none', color: '#2e3e57', fontSize: '14px' }}>
                                    {category}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #0d3b76 0%, #2961bc 100%)', borderRadius: '24px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden', minHeight: '370px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '38px', fontWeight: 800, lineHeight: '1.02', marginBottom: '18px' }}>
                                Màn DEAL <span style={{ color: '#ffea66' }}>CHUẨN NET</span>
                            </div>
                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', maxWidth: '520px', marginBottom: '20px' }}>
                                Ưu đãi lớn cho học sinh – sinh viên, giảm đến 50% và thêm 500K với ShopeePay. Áp dụng đến hết 19.07.2026.
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {bannerCards.slice(0, 2).map((card, index) => (
                                <div key={index} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '18px', padding: '18px', minHeight: '92px' }}>
                                    <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>{card.title}</div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{card.detail}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '12px', marginTop: '24px' }}>
                            {heroCategories.map((item, index) => (
                                <button key={index} onClick={() => setSelectedCategory(item.name)} style={{ background: '#ffffff22', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '999px', padding: '10px 14px', fontSize: '13px', color: '#ffffff', cursor: 'pointer' }}>
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        <div style={{ backgroundColor: '#ff9f00', borderRadius: '20px', color: '#1b1b1b', padding: '28px 20px', minHeight: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 18px 40px rgba(255, 159, 0, 0.2)' }}>
                            <div style={{ fontSize: '20px', fontWeight: 800 }}>ƯU ĐÃI HỌC SINH - SINH VIÊN</div>
                            <div style={{ fontSize: '28px', fontWeight: 900 }}>Giảm đến 1 triệu</div>
                        </div>
                        <div style={{ backgroundColor: '#1374ff', borderRadius: '20px', color: '#ffffff', padding: '28px 20px', minHeight: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 18px 40px rgba(19, 116, 255, 0.2)' }}>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>Khuyến mãi tháng này</div>
                            <div style={{ fontSize: '34px', fontWeight: 900 }}>Giảm đến 50%</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {bannerCards.map((card, index) => (
                        <div key={index} style={{ backgroundColor: '#ffffff', borderRadius: '18px', padding: '24px 18px', boxShadow: '0 18px 40px rgba(15, 50, 92, 0.08)', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4b5c7b' }}>{card.title}</div>
                            <div style={{ fontSize: '22px', fontWeight: 800, color: card.color }}>{card.detail}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#5b6c8d', fontSize: '14px', justifyContent: 'center' }}>
                    <span>ƯU ĐÃI HOT</span>
                    <span>GIỜ VÀNG GIÁ SỐC</span>
                    <span>SINH NHẬT SIÊU DEAL</span>
                    <span>MIỄN PHÍ CÀI ĐẶT</span>
                    <span>TRẢ GÓP 0%</span>
                    <span>APPLE EDUCATION</span>
                    <span>TẢI APP PHONG VŨ</span>
                    <span>XẢ KHO TRƯNG BÀY</span>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', boxShadow: '0 18px 40px rgba(15, 50, 92, 0.06)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ fontSize: '26px', fontWeight: 700 }}>SẢN PHẨM NỔI BẬT</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                            <button onClick={() => { setSelectedCategory(''); setSearchTerm(''); }} style={{ padding: '10px 18px', borderRadius: '999px', border: '1px solid #d8e3f3', backgroundColor: '#ffffff', color: '#1f2d3d', cursor: 'pointer' }}>Tất cả</button>
                            {categories.slice(0, 4).map((category, index) => (
                                <button key={index} onClick={() => setSelectedCategory(category)} style={{ padding: '10px 18px', borderRadius: '999px', border: '1px solid #d8e3f3', backgroundColor: selectedCategory === category ? '#0d3b76' : '#f4f8ff', color: selectedCategory === category ? '#ffffff' : '#1f2d3d', cursor: 'pointer' }}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#5f6f8b' }}>
                            Đang tải sản phẩm...
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                            {filteredProducts.map(product => (
                                <div key={product._id} style={{ backgroundColor: '#f8fbff', borderRadius: '18px', padding: '18px', border: '1px solid #e7eef8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ height: '180px', marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: '16px', backgroundColor: '#ffffff' }}>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x150?text=Loi+Anh'; }}
                                            />
                                        </div>
                                        <h4 style={{ margin: '0 0 10px 0', color: '#1f2d3d', fontSize: '18px', fontWeight: 700 }}>{product.name}</h4>
                                        <p style={{ margin: '0 0 14px 0', color: '#ff5252', fontSize: '20px', fontWeight: 800 }}>
                                            {product.price.toLocaleString()} VNĐ
                                        </p>
                                        <p style={{ margin: 0, color: '#5f6f8b', fontSize: '14px', minHeight: '42px', overflow: 'hidden' }}>{product.description || 'Chưa có mô tả sản phẩm.'}</p>
                                    </div>
                                    <div style={{ marginTop: '18px' }}>
                                        <p style={{ margin: '0 0 10px 0', fontWeight: 700, color: product.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                                            {product.stock > 0 ? `✓ Còn hàng (${product.stock})` : '✕ Hết hàng'}
                                        </p>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock <= 0}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                border: 'none',
                                                backgroundColor: product.stock > 0 ? '#0d3b76' : '#9aa5b1',
                                                color: '#ffffff',
                                                fontWeight: 700,
                                                cursor: product.stock > 0 ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {filteredProducts.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#5f6f8b' }}>
                                    <h3>Không tìm thấy sản phẩm nào.</h3>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {modal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        width: '360px',
                        backgroundColor: '#ffffff',
                        borderRadius: '18px',
                        padding: '28px',
                        boxShadow: '0 24px 60px rgba(16, 40, 102, 0.18)',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', color: '#0f2f59' }}>ℹ️ Thông báo</h3>
                        <p style={{ margin: 0, color: '#4b5b7a', fontSize: '15px' }}>{modal.message}</p>
                        <button onClick={closeModal} style={{ marginTop: '22px', padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#0d3b76', color: 'white', cursor: 'pointer', fontWeight: 700 }}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;