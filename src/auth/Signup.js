import React, { useState } from 'react';
import axios from 'axios';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { useNavigate , Link } from 'react-router-dom';
import "../styles/signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
  });

  const navigate = useNavigate(); 
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://geomesh-back.onrender.com/api/signup', formData);
      setMessage(response.data.message);
      NotificationManager.success('Signup Successfully', 'Account Created');
      localStorage.setItem('email', formData.email);
      localStorage.setItem('name', formData.name);
      navigate('/person-info');

    } catch (err) {
      setMessage(err.response?.data?.message || 'Error occurred');
      NotificationManager.warning('Warning message',  `${err.response}` , 3000);
    }
  };

  return (
    <div>
      <Link to="/signin" style={{position : "absolute" , right : "2rem" , top : "3rem"}} >
        <button>Sign In</button>
      </Link>
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
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
        <input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
