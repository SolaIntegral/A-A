import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth';

const Auth = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      onLogin();
      navigate('/tasks');
    } catch (error) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('パスワードが一致しません。');
      return;
    }

    try {
      await register(formData.email, formData.username, formData.password, formData.passwordConfirm);
      setActiveTab(0);
      setError('');
    } catch (error) {
      setError('登録に失敗しました。入力内容を確認してください。');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Budy
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="ログイン" />
            <Tab label="新規登録" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="メールアドレス"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="パスワード"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              ログイン
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegister}>
            <TextField
              fullWidth
              label="メールアドレス"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="ユーザー名"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="パスワード"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="パスワード（確認）"
              name="passwordConfirm"
              type="password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              登録
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Auth; 