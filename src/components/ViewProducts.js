import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSpinner, FaSearch, FaFilter, FaTrash, FaEdit } from 'react-icons/fa';
import API from '../api';

// Import categories from AddProduct
const CATEGORIES = [
  {
    value: 'groceries-staples',
    label: 'Groceries & Staples',
    description: 'Essentials like rice, wheat, pulses, sugar, oil'
  },
  {
    value: 'fruits-vegetables',
    label: 'Fruits & Vegetables',
    description: 'Fresh produce — daily household need'
  },
  {
    value: 'dairy-bakery',
    label: 'Dairy & Bakery',
    description: 'Milk, cheese, butter, bread, cakes'
  },
  {
    value: 'snacks-packaged',
    label: 'Snacks & Packaged Food',
    description: 'Chips, biscuits, noodles, ready-to-eat items'
  },
  {
    value: 'beverages',
    label: 'Beverages',
    description: 'Water, juices, tea, coffee, soft drinks'
  },
  {
    value: 'personal-care',
    label: 'Personal Care',
    description: 'Soaps, shampoos, toothpaste, hygiene products'
  },
  {
    value: 'household',
    label: 'Household Essentials',
    description: 'Detergents, cleaning supplies, tissues'
  },
  {
    value: 'meat-seafood',
    label: 'Meat & Seafood',
    description: 'Fresh/frozen meat and fish'
  }
];

function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'quantity') {
        comparison = a.quantity - b.quantity;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || 'uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setDeleteLoading(productId);
      await API.delete(`/products/${productId}`);
      // Remove the deleted product from the state
      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError('Failed to delete product. Please try again.');
      console.error('Error deleting product:', err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatQuantity = (product) => {
    const quantity = product.quantity;
    const unit = product.unit;
    let unitDisplay = '';
    
    switch(unit) {
      case 'kg':
        unitDisplay = 'kg';
        break;
      case 'litre':
        unitDisplay = 'L';
        break;
      case 'box':
        unitDisplay = 'box';
        break;
      case 'pack':
        unitDisplay = 'pack';
        break;
      default:
        unitDisplay = 'pcs';
    }

    return `${quantity} ${unitDisplay}`;
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return {
        text: 'Out of Stock',
        class: 'stock-out'
      };
    } else if (product.quantity <= product.min_stock_level) {
      return {
        text: `Low Stock (${formatQuantity(product)} available)`,
        class: 'low-stock'
      };
    } else {
      return {
        text: `${formatQuantity(product)} in stock`,
        class: 'in-stock'
      };
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="btn btn-primary" onClick={loadProducts}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="products-container fade-in">
      <div className="products-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-state">
          <p>No products found matching your search criteria.</p>
          <Link to="/add" className="btn btn-primary">
            <FaPlus /> Add New Product
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {Object.entries(groupedProducts).map(([category, products]) => (
            <div key={category} className="category-section">
              <h3 className="category-title">
                {CATEGORIES.find(c => c.value === category)?.label || 'Uncategorized'}
              </h3>
              <div className="products-card-grid">
                {products.map(prod => (
                  <div key={prod.id} className="product-card">
                    <div className="product-card-header">
                      <h4 className="product-name">{prod.name}</h4>
                      {prod.brand && <span className="product-brand">{prod.brand}</span>}
                    </div>
                    
                    {prod.description && (
                      <p className="product-description">{prod.description}</p>
                    )}
                    
                    <div className="product-details">
                      <div className="product-price-section">
                        {prod.discount > 0 ? (
                          <div className="price-with-discount">
                            <span className="original-price">₹{prod.price.toFixed(2)}</span>
                            <span className="discounted-price">
                              ₹{(prod.price * (1 - prod.discount / 100)).toFixed(2)}
                            </span>
                            <span className="discount-badge">-{prod.discount}%</span>
                          </div>
                        ) : (
                          <span className="product-price">₹{prod.price.toFixed(2)}</span>
                        )}
                      </div>
                      
                      <div className="product-stock">
                        <span className={`stock-badge ${prod.quantity === 0 ? 'out-of-stock' : prod.quantity < 10 ? 'low-stock' : 'in-stock'}`}>
                          {prod.quantity === 0 ? (
                            'Out of Stock'
                          ) : (
                            `${prod.quantity} ${prod.unit === 'kg' ? 'kg' : 
                              prod.unit === 'litre' ? 'L' : 
                              prod.unit === 'pcs' ? 'units' : 
                              prod.unit || 'units'} in stock`
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="product-actions">
                      <Link to={`/edit/${prod.id}`} className="btn btn-secondary btn-sm">
                        <FaEdit /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="btn btn-danger btn-sm"
                        disabled={deleteLoading === prod.id}
                      >
                        {deleteLoading === prod.id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <FaTrash />
                        )} Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewProducts;
