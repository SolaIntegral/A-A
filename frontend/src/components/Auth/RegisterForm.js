import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { initFirebase } from '../../firebase';

export default function RegisterForm({ onSwitchToLogin, onError }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onError('');

    if (password !== confirmPassword) {
      onError('パスワードが一致しません');
      setLoading(false);
      return;
    }

    try {
      const { auth, db } = await initFirebase();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // ユーザープロフィールを更新
      await updateProfile(userCredential.user, {
        displayName: username
      });

      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        username,
        email,
        createdAt: new Date(),
        skills: {
          learning: { level: 1, exp: 0 },
          creativity: { level: 1, exp: 0 },
          execution: { level: 1, exp: 0 },
          communication: { level: 1, exp: 0 }
        }
      });

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        onError('このメールアドレスは既に使用されています');
      } else if (error.code === 'auth/weak-password') {
        onError('パスワードは6文字以上で入力してください');
      } else {
        onError('アカウント作成に失敗しました');
      }
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
        id="username"
        label="ユーザー名"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="パスワード"
        type="password"
        id="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="パスワード（確認）"
        type="password"
        id="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'アカウント作成'}
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={onSwitchToLogin}
      >
        既にアカウントをお持ちの方はこちら
      </Button>
    </Box>
  );
} 