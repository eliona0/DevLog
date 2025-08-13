import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import '../styles/auth.css';

function AuthPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');

  const [isLogin, setIsLogin] = useState(mode !== 'register');

  useEffect(() => {
    setIsLogin(mode !== 'register');
  }, [mode]);

  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1>Welcome to DevLog</h1>
        <p>Track your journey. Log your growth.</p>
        <div className="pattern"></div>
      </div>
      <div className="auth-right">
        {isLogin ? (
          <LoginForm onSwitch={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
