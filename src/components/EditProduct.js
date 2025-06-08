import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [product, setProduct] = useState({
    name: '',
    description: '',
    category_id: '',
    brand: '',
    price: '',
    quantity: '',
    discount: '',
    expiry_date: '',
    min_stock_level: '',
    reorder_quantity: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both product and categories data concurrently
      const [productRes, categoriesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/products/${id}`),
        axios.get('http://localhost:5000/api/categories')
      ]);

      const productData = productRes.data;
      setProduct({
        ...productData,
        price: productData.price.toString(),
        quantity: productData.quantity.toString(),
        discount: productData.discount?.toString() || '',
        min_stock_level: productData.min_stock_level?.toString() || '',
        reorder_quantity: productData.reorder_quantity?.toString() || ''
      });
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching product data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!product.name.trim()) errors.name = 'Product name is required';
    if (!product.category_id) errors.category_id = 'Category is required';
    if (!product.price || parseFloat(product.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!product.quantity || parseInt(product.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }
    if (product.discount && (parseFloat(product.discount) < 0 || parseFloat(product.discount) > 100)) {
      errors.discount = 'Discount must be between 0 and 100';
    }
    if (product.min_stock_level && parseInt(product.min_stock_level) < 0) {
      errors.min_stock_level = 'Minimum stock level cannot be negative';
    }
    if (product.reorder_quantity && parseInt(product.reorder_quantity) <= 0) {
      errors.reorder_quantity = 'Reorder quantity must be greater than 0';
    }
    if (product.expiry_date && new Date(product.expiry_date) < new Date()) {
      errors.expiry_date = 'Expiry date cannot be in the past';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle numeric inputs
    if (['price', 'quantity', 'discount', 'min_stock_level', 'reorder_quantity'].includes(name)) {
      if (value === '') {
        processedValue = '';
      } else {
        const numValue = name === 'price' ? parseFloat(value) : parseInt(value);
        if (!isNaN(numValue)) {
          processedValue = numValue.toString();
        } else {
          return;
        }
      }
    }

    setProduct(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productData = {
        ...product,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity),
        discount: product.discount ? parseFloat(product.discount) : null,
        min_stock_level: product.min_stock_level ? parseInt(product.min_stock_level) : null,
        reorder_quantity: product.reorder_quantity ? parseInt(product.reorder_quantity) : null
      };

      await axios.put(`http://localhost:5000/api/products/${id}`, productData);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading product data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>
          <FaArrowLeft /> Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="edit-product-container">
      <div className="edit-product-header">
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>
          <FaArrowLeft /> Back to Products
        </button>
        <h1>Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="edit-product-form">
        <div className="form-grid">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                className={validationErrors.name ? 'error' : ''}
                placeholder="Enter product name"
              />
              {validationErrors.name && <span className="error-message">{validationErrors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={product.category_id}
                onChange={handleChange}
                className={validationErrors.category_id ? 'error' : ''}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {validationErrors.category_id && (
                <span className="error-message">{validationErrors.category_id}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={product.brand}
                onChange={handleChange}
                placeholder="Enter brand name"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Inventory & Pricing</h2>
            
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleChange}
                className={validationErrors.price ? 'error' : ''}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {validationErrors.price && <span className="error-message">{validationErrors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={product.quantity}
                onChange={handleChange}
                className={validationErrors.quantity ? 'error' : ''}
                placeholder="0"
                min="0"
              />
              {validationErrors.quantity && (
                <span className="error-message">{validationErrors.quantity}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount (%)</label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={product.discount}
                onChange={handleChange}
                className={validationErrors.discount ? 'error' : ''}
                placeholder="0"
                min="0"
                max="100"
              />
              {validationErrors.discount && (
                <span className="error-message">{validationErrors.discount}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expiry_date">Expiry Date</label>
              <input
                type="date"
                id="expiry_date"
                name="expiry_date"
                value={product.expiry_date}
                onChange={handleChange}
                className={validationErrors.expiry_date ? 'error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.expiry_date && (
                <span className="error-message">{validationErrors.expiry_date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="min_stock_level">Minimum Stock Level</label>
              <input
                type="number"
                id="min_stock_level"
                name="min_stock_level"
                value={product.min_stock_level}
                onChange={handleChange}
                className={validationErrors.min_stock_level ? 'error' : ''}
                placeholder="0"
                min="0"
              />
              {validationErrors.min_stock_level && (
                <span className="error-message">{validationErrors.min_stock_level}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reorder_quantity">Reorder Quantity</label>
              <input
                type="number"
                id="reorder_quantity"
                name="reorder_quantity"
                value={product.reorder_quantity}
                onChange={handleChange}
                className={validationErrors.reorder_quantity ? 'error' : ''}
                placeholder="0"
                min="1"
              />
              {validationErrors.reorder_quantity && (
                <span className="error-message">{validationErrors.reorder_quantity}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : <FaSave />} Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct; 