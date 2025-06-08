import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa';
import API from '../api';

function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const [product, setProduct] = useState({
    name: '',
    description: '',
    category_id: '',
    brand: '',
    quantity: 0,
    unit: 'pcs',
    price: '0.00',
    discount: '0.00',
    expiry_date: '',
    min_stock_level: 10,
    reorder_quantity: 20
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!product.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!product.category_id) {
      errors.category_id = 'Category is required';
    }
    
    if (product.quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }
    
    if (product.price < 0) {
      errors.price = 'Price cannot be negative';
    }
    
    if (product.discount < 0 || product.discount > 100) {
      errors.discount = 'Discount must be between 0 and 100';
    }
    
    if (product.min_stock_level < 0) {
      errors.min_stock_level = 'Minimum stock level cannot be negative';
    }
    
    if (product.reorder_quantity < 0) {
      errors.reorder_quantity = 'Reorder quantity cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Handle numeric inputs
    if (['quantity', 'price', 'discount', 'min_stock_level', 'reorder_quantity'].includes(name)) {
      processedValue = value === '' ? '' : Number(value);
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
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const productData = {
        ...product,
        quantity: parseInt(product.quantity) || 0,
        price: parseFloat(product.price) || 0,
        discount: parseFloat(product.discount) || 0,
        min_stock_level: parseInt(product.min_stock_level) || 10,
        reorder_quantity: parseInt(product.reorder_quantity) || 20,
        expiry_date: product.expiry_date || null,
        // Ensure unit is one of the allowed values
        unit: ['pcs', 'kg', 'litre', 'box', 'pack'].includes(product.unit) ? product.unit : 'pcs'
      };

      await API.post('/products', productData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product. Please try again.');
      console.error('Error adding product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container fade-in">
      <div className="form-header">
        <h2 className="page-title">Add New Product</h2>
        <Link to="/" className="btn btn-secondary">
          <FaArrowLeft /> Back to Products
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={product.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="form-input"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Category *</label>
                <div className="select-wrapper">
                  <select
                    id="category_id"
                    name="category_id"
                    value={product.category_id}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {product.category_id && (
                    <div className="category-description">
                      {categories.find(c => c.id === parseInt(product.category_id))?.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="brand">Brand</label>
                <input
                  id="brand"
                  name="brand"
                  type="text"
                  value={product.brand}
                  onChange={handleChange}
                  placeholder="Enter brand"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Inventory & Pricing */}
          <div className="form-section">
            <h3>Inventory & Pricing</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity *</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  required
                  min="0"
                  value={product.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={product.unit}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kilograms</option>
                  <option value="litre">Liters</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                </select>
                <small className="form-help">Select the unit of measurement</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="min_stock_level">Minimum Stock Level</label>
                <input
                  id="min_stock_level"
                  name="min_stock_level"
                  type="number"
                  min="0"
                  value={product.min_stock_level}
                  onChange={handleChange}
                  placeholder="Enter minimum stock level"
                  className="form-input"
                />
                <small className="form-help">Alert when stock falls below this level</small>
              </div>

              <div className="form-group">
                <label htmlFor="reorder_quantity">Reorder Quantity</label>
                <input
                  id="reorder_quantity"
                  name="reorder_quantity"
                  type="number"
                  min="0"
                  value={product.reorder_quantity}
                  onChange={handleChange}
                  placeholder="Enter reorder quantity"
                  className="form-input"
                />
                <small className="form-help">Suggested quantity to reorder</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={product.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  className={`form-input ${validationErrors.price ? 'error' : ''}`}
                />
                {validationErrors.price && (
                  <small className="error-text">{validationErrors.price}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="discount">Discount (%)</label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={product.discount}
                  onChange={handleChange}
                  placeholder="Enter discount"
                  className={`form-input ${validationErrors.discount ? 'error' : ''}`}
                />
                {validationErrors.discount && (
                  <small className="error-text">{validationErrors.discount}</small>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="expiry_date">Expiry Date</label>
              <input
                id="expiry_date"
                name="expiry_date"
                type="date"
                value={product.expiry_date}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || Object.keys(validationErrors).length > 0}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Adding Product...
              </>
            ) : (
              <>
                <FaSave /> Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
