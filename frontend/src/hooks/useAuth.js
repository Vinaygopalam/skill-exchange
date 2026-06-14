import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  return {
    user: (() => {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    })(),
    token: localStorage.getItem('token'),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };
};

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`
});