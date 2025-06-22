import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../Auth/AuthProvider';
import { initFirebase } from '../../firebase';

const SKILL_LABELS = {
  learning: '学習力',
  creativity: '創造力',
  execution: '実行力',
  communication: 'コミュニケーション力'
};

const CATEGORY_LABELS = {
  work: '仕事',
  study: '学習',
  personal: 'プライベート',
  other: 'その他'
};

export default function LearningHistory() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const loadCompletedTasks = async () => {
      try {
        const { db } = await initFirebase();
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('completed', '==', true),
          orderBy('completedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const taskList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCompletedTasks(taskList);
        });

        return unsubscribe;
      } catch (error) {
        console.error('完了タスク読み込みエラー:', error);
      }
    };

    loadCompletedTasks();
  }, [user]);

  const filteredTasks = completedTasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'with-learning') return task.learning;
    if (filter === 'no-learning') return !task.learning;
    return task.skillCategory === filter;
  });

  const tasksWithLearning = filteredTasks.filter(task => task.learning);
  const tasksWithoutLearning = filteredTasks.filter(task => !task.learning);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          学習記録
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>フィルター</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label="フィルター"
            >
              <MenuItem value="all">すべて</MenuItem>
              <MenuItem value="with-learning">学びあり</MenuItem>
              <MenuItem value="no-learning">学びなし</MenuItem>
              <MenuItem value="learning">学習力</MenuItem>
              <MenuItem value="creativity">創造力</MenuItem>
              <MenuItem value="execution">実行力</MenuItem>
              <MenuItem value="communication">コミュニケーション力</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`完了タスク: ${filteredTasks.length}件`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`学びあり: ${tasksWithLearning.length}件`} 
            color="success" 
            variant="outlined" 
          />
          <Chip 
            label={`学びなし: ${tasksWithoutLearning.length}件`} 
            color="warning" 
            variant="outlined" 
          />
        </Box>

        {/* 学びありのタスク */}
        {tasksWithLearning.length > 0 && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" color="success.main">
                学びを記録したタスク ({tasksWithLearning.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasksWithLearning.map(task => (
                  <Card key={task.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                      
                      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {task.skillCategory && (
                          <Chip 
                            label={SKILL_LABELS[task.skillCategory]} 
                            size="small" 
                            color="primary" 
                          />
                        )}
                        {task.taskCategory && (
                          <Chip 
                            label={CATEGORY_LABELS[task.taskCategory]} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                        <Chip 
                          label={`完了: ${task.completedAt?.toDate().toLocaleDateString()}`} 
                          size="small" 
                          color="success" 
                        />
                      </Box>

                      <Typography 
                        variant="body1" 
                        color="success.main" 
                        sx={{ 
                          fontStyle: 'italic',
                          backgroundColor: '#f0f8f0',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid #4caf50'
                        }}
                      >
                        💡 <strong>学んだこと:</strong><br />
                        {task.learning}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {/* 学びなしのタスク */}
        {tasksWithoutLearning.length > 0 && (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" color="warning.main">
                学びを記録していないタスク ({tasksWithoutLearning.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasksWithoutLearning.map(task => (
                  <Card key={task.id} variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {task.title}
                      </Typography>
                      
                      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {task.skillCategory && (
                          <Chip 
                            label={SKILL_LABELS[task.skillCategory]} 
                            size="small" 
                            color="primary" 
                          />
                        )}
                        {task.taskCategory && (
                          <Chip 
                            label={CATEGORY_LABELS[task.taskCategory]} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                        <Chip 
                          label={`完了: ${task.completedAt?.toDate().toLocaleDateString()}`} 
                          size="small" 
                          color="success" 
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        このタスクでは学びが記録されていません。
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}

        {filteredTasks.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            完了したタスクがありません
          </Typography>
        )}
      </CardContent>
    </Card>
  );
} 