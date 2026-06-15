import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import Navbar mới tạo
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import UserManagement from './components/UserManagement'; 
import ProductManagement from './components/ProductManagement';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderManagement from './components/OrderManagement';
import CategoryManagement from './components/CategoryManagement'; // MỚI: Import trang quản lý danh mục
import OrderHistory from './components/OrderHistory';

const AdminProtectedRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/home" />; 
  }
  return children; 
};

const StaffProtectedRoute = ({ children }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user || (user.role !== 'ADMIN' && user.role !== 'EMPLOYEE')) {
    return <Navigate to="/home" />; 
  }
  return children; 
};

function App() {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  return (
    <Router>
      <Navbar />

      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/my-orders"
            element={user ? <OrderHistory /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <UserManagement />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <StaffProtectedRoute>
                <ProductManagement />
              </StaffProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <StaffProtectedRoute>
                <CategoryManagement />
              </StaffProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <StaffProtectedRoute>
                <OrderManagement />
              </StaffProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;