import { BrowserRouter as Router, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaPlus, FaList, FaBars, FaTimes, FaHome, FaChartBar } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import EditProduct from './components/EditProduct';
import ViewProducts from './components/ViewProducts';
import './App.css';

// Separate component for navbar to use hooks
function Navbar({ isMenuOpen, toggleMenu, closeMenu }) {
  const location = useLocation();
  const [lowStockCount, setLowStockCount] = useState(0);

  // Fetch low stock count
  useEffect(() => {
    const fetchLowStockCount = async () => {
      try {
        const response = await fetch('https://inv-back-dbul.onrender.com/api/products');
        const products = await response.json();
        const lowStock = products.filter(p => p.quantity <= p.min_stock_level && p.quantity > 0).length;
        setLowStockCount(lowStock);
      } catch (error) {
        console.error('Error fetching low stock count:', error);
      }
    };
    fetchLowStockCount();
  }, [location.pathname]); // Refetch when location changes

  return (
    <nav className="navbar">
      <div className="nav-content">
        <NavLink to="/" className="nav-brand" onClick={closeMenu}>
          <FaShoppingCart /> Supermarket Inventory
        </NavLink>
        
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <FaHome /> Dashboard
          </NavLink>
          
          <NavLink 
            to="/products" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
            data-notification={lowStockCount > 0 ? lowStockCount : null}
          >
            <FaList /> Products
          </NavLink>
          
          <NavLink 
            to="/add" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <FaPlus /> Add Product
          </NavLink>
          
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <FaChartBar /> Analytics
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar 
          isMenuOpen={isMenuOpen} 
          toggleMenu={toggleMenu} 
          closeMenu={closeMenu} 
        />

        <main className="main-content fade-in">
          <Routes>
            <Route path="/" element={<ViewProducts />} />
            <Route path="/products" element={<ViewProducts />} />
            <Route path="/add" element={<AddProduct />} />
            <Route path="/edit/:id" element={<EditProduct />} />
            <Route path="/analytics" element={<div className="coming-soon">Analytics Dashboard Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
