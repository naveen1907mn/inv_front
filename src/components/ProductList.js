import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';

function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await API.get('/products');
      setProducts(res.data);
    };
    load();
  }, []);

  const deleteProduct = async (id) => {
    await API.delete(`/products/${id}`);
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h2>Product List</h2>
      <Link to="/add">➕ Add Product</Link>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - Qty: {p.quantity} - ₹{p.price}
            <Link to={`/edit/${p.id}`}> ✏️</Link>
            <button onClick={() => deleteProduct(p.id)}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
