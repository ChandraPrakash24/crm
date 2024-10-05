import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Input, message } from 'antd';
import 'tailwindcss/tailwind.css';
import backgroundImage from './assets/bg.webp'; 

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post(
        // "https://neev-system.neevcloud.org/api/login",
        // "http://localhost:3001/api/login",
        "https://admin2-dash.zata.ai/api/login",
        values
      );
      message.success("Login successful!");
      console.log(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/");
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ 
        backgroundImage: `url(${backgroundImage})` 
      }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Login</h2>
        <Form onFinish={handleLogin}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input 
              placeholder="Email" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              placeholder="Password" 
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" 
            />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              block
              className="w-full py-2 bg-indigo-600 text-white rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
