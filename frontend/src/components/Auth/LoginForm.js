import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { initFirebase } from '../../firebase';

export default function LoginForm({ onSwitchToRegister, onError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onError('');

    try {
      const { auth } = await initFirebase();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      onError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="メールアドレス"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="パスワード"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'ログイン'}
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={onSwitchToRegister}
      >
        アカウントをお持ちでない方はこちら
      </Button>
    </Box>
  );
} 