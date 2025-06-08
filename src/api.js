import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://inv-back-dbul.onrender.com';

const API = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default API;
