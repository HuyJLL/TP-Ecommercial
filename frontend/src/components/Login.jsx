import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', {
                email,
                password
            });
            setMessage(response.data.message);
            
            // Lưu thông tin user vào localStorage để dùng cho các trang khác
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
            
            navigate('/home');
            
        } catch (error) {
            setMessage(error.response?.data?.message || 'Sai thông tin đăng nhập!');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Đăng Nhập</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        type="email" 
                        placeholder="Nhập email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        type="password" 
                        placeholder="Nhập mật khẩu" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Đăng Nhập
                </button>
            </form>
            {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
            <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
        </div>
    );
};

export default Login;