import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress
} from '@mui/material';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthProvider';
import { initFirebase } from '../../firebase';

const SKILL_LABELS = {
  learning: '学習力',
  creativity: '創造力',
  execution: '実行力',
  communication: 'コミュニケーション力'
};

const SKILL_COLORS = {
  learning: '#2196f3',
  creativity: '#9c27b0',
  execution: '#4caf50',
  communication: '#ff9800'
};

export default function SkillAnalytics() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const { db } = await initFirebase();
        
        // タスクの読み込み
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );

        const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
          const taskList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setTasks(taskList);
        });

        // ユーザーデータの読み込み
        const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
        });

        return () => {
          unsubscribeTasks();
          unsubscribeUser();
        };
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      }
    };

    loadData();
  }, [user]);

  if (!userData) return null;

  const skills = userData.skills || {
    learning: { level: 1, exp: 0 },
    creativity: { level: 1, exp: 0 },
    execution: { level: 1, exp: 0 },
    communication: { level: 1, exp: 0 }
  };

  // スキル別統計
  const skillStats = Object.keys(skills).map(skillKey => {
    const skillTasks = tasks.filter(task => task.skillCategory === skillKey);
    const completedTasks = skillTasks.filter(task => task.completed);
    const tasksWithLearning = completedTasks.filter(task => task.learning);
    
    return {
      skillKey,
      label: SKILL_LABELS[skillKey],
      color: SKILL_COLORS[skillKey],
      level: skills[skillKey].level,
      exp: skills[skillKey].exp,
      totalTasks: skillTasks.length,
      completedTasks: completedTasks.length,
      tasksWithLearning: tasksWithLearning.length,
      completionRate: skillTasks.length > 0 ? (completedTasks.length / skillTasks.length) * 100 : 0,
      learningRate: completedTasks.length > 0 ? (tasksWithLearning.length / completedTasks.length) * 100 : 0
    };
  });

  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(task => task.completed).length;
  const totalWithLearning = tasks.filter(task => task.completed && task.learning).length;
  const overallCompletionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
  const overallLearningRate = totalCompleted > 0 ? (totalWithLearning / totalCompleted) * 100 : 0;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          スキル分析
        </Typography>

        {/* 全体統計 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            全体統計
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {totalTasks}
                </Typography>
                <Typography variant="caption">総タスク数</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {totalCompleted}
                </Typography>
                <Typography variant="caption">完了タスク</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {totalWithLearning}
                </Typography>
                <Typography variant="caption">学び記録</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {Math.round(overallCompletionRate)}%
                </Typography>
                <Typography variant="caption">完了率</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              完了率
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={overallCompletionRate} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              学び記録率
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={overallLearningRate} 
              sx={{ height: 8, borderRadius: 4 }}
              color="success"
            />
          </Box>
        </Box>

        {/* スキル別統計 */}
        <Typography variant="subtitle1" gutterBottom>
          スキル別統計
        </Typography>
        <Grid container spacing={2}>
          {skillStats.map(stat => (
            <Grid item xs={12} sm={6} key={stat.skillKey}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: stat.color }}>
                      {stat.label}
                    </Typography>
                    <Chip 
                      label={`Lv.${stat.level}`} 
                      size="small" 
                      sx={{ backgroundColor: stat.color, color: 'white' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      タスク数: {stat.totalTasks}件 / 完了: {stat.completedTasks}件
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stat.completionRate} 
                      sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      学び記録: {stat.tasksWithLearning}件 ({Math.round(stat.learningRate)}%)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stat.learningRate} 
                      sx={{ height: 6, borderRadius: 3, backgroundColor: '#e0e0e0' }}
                      color="success"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    経験値: {stat.exp}/100
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 