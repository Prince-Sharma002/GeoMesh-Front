import React, { useState } from 'react';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { useNavigate } from 'react-router-dom';
import "../styles/signin.css";

const Signin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const navigate = useNavigate(); 
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://geomesh-back.onrender.com/api/signin', formData);
      setMessage(response.data.message);
      // Store token in localStorage if provided (for authentication)
      if (response.data.token) localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', formData.email);
      localStorage.setItem('name', formData.name);
      navigate('/person-info');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
      <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign In</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signin;
