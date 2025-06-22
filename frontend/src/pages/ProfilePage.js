import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';

export default function ProfilePage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        const { db } = await initFirebase();
        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('ユーザーデータ読み込みエラー:', error);
      }
    };

    loadUserData();
  }, [user]);

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>読み込み中...</Typography>
      </Box>
    );
  }

  const skills = userData.skills || {
    learning: { level: 1, exp: 0 },
    creativity: { level: 1, exp: 0 },
    execution: { level: 1, exp: 0 },
    communication: { level: 1, exp: 0 }
  };

  const totalLevel = Object.values(skills).reduce((sum, skill) => sum + skill.level, 0);
  const totalExp = Object.values(skills).reduce((sum, skill) => sum + skill.exp, 0);
  const maxExp = totalLevel * 100; // 次のレベルまでの経験値

  const skillLabels = {
    learning: '学習力',
    creativity: '創造力',
    execution: '実行力',
    communication: 'コミュニケーション力'
  };

  const getSkillProgress = (skill) => {
    const expInLevel = skill.exp % 100;
    return (expInLevel / 100) * 100;
  };

  return (
    <Box p={3}>
      {/* 全体レベル */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          全体レベル
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={(totalExp / maxExp) * 100}
            size={100}
            thickness={4}
            sx={{ color: '#2196f3' }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h4" component="div" color="primary">
              {totalLevel}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          経験値: {totalExp} / {maxExp}
        </Typography>
      </Paper>

      {/* スキル一覧 */}
      <Grid container spacing={2}>
        {Object.entries(skills).map(([skillKey, skill]) => (
          <Grid item xs={12} sm={6} md={3} key={skillKey}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {skillLabels[skillKey]}
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={getSkillProgress(skill)}
                  size={80}
                  thickness={4}
                  sx={{ color: '#4caf50' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" component="div" color="success.main">
                    {skill.level}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                経験値: {skill.exp}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 