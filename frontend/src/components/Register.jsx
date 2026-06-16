import { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault(); // Ngăn trang bị reload khi submit form
        
        // Kiểm tra mật khẩu xác nhận
        if (password !== confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            // Gọi API backend
            const response = await api.post('/auth/register', {
                email,
                password
            });
            setMessage(response.data.message);
            // Chuyển hướng sang trang đăng nhập sau 2 giây
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            // Bắt lỗi từ backend trả về (ví dụ: email đã tồn tại)
            setMessage(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Đăng Ký Tài Khoản</h2>
            <form onSubmit={handleRegister}>
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
                <div style={{ marginBottom: '10px' }}>
                    <input 
                        type="password" 
                        placeholder="Xác nhận mật khẩu" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Đăng Ký
                </button>
            </form>
            {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
            <p>Đã có tài khoản? <a href="/login">Đăng nhập ngay</a></p>
        </div>
    );
};

export default Register;