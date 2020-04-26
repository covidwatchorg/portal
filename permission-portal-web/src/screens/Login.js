import React, { useState } from 'react';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {

  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h1>Permission Portal</h1>
        <form className="login-form" onSubmit={onLogin}>
          <label className="input-field">
            <p className="input-label">Username</p>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label className="input-field">
            <p className="input-label">Password</p>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default Login;