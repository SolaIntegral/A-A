import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';

export default function ProjectListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [tasksByProject, setTasksByProject] = useState({});

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { db } = await initFirebase();
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return unsubscribe;
    };
    fetchProjects();
  }, [user]);

  // プロジェクトごとのタスクを取得
  useEffect(() => {
    if (!user || projects.length === 0) return;
    const fetchTasks = async () => {
      const { db } = await initFirebase();
      let newTasksByProject = {};
      for (const project of projects) {
        const q = query(collection(db, 'tasks'), where('project', '==', project.name), where('userId', '==', user.uid));
        const snap = await getDocs(q);
        newTasksByProject[project.id] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setTasksByProject(newTasksByProject);
    };
    fetchTasks();
  }, [projects, user]);

  const handleOpenForm = (project = null) => {
    setEditProject(project);
    setFormData({
      name: project?.name || '',
      description: project?.description || ''
    });
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditProject(null);
    setFormData({ name: '', description: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { db } = await initFirebase();
      if (editProject) {
        await updateDoc(doc(db, 'projects', editProject.id), {
          ...formData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'projects'), {
          ...formData,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      handleCloseForm();
    } catch (error) {
      alert('保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このプロジェクトを削除しますか？')) return;
    try {
      const { db } = await initFirebase();
      await deleteDoc(doc(db, 'projects', id));
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  const handleAccordionChange = (projectId) => {
    setExpanded(expanded === projectId ? null : projectId);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">プロジェクト一覧</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>
          新規作成
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {projects.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            プロジェクトがありません。新しいプロジェクトを作成しましょう！
          </Typography>
        )}
        {projects.map(project => (
          <Accordion key={project.id} expanded={expanded === project.id} onChange={() => handleAccordionChange(project.id)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography variant="h6">{project.name}</Typography>
                <Typography variant="body2" color="text.secondary">{project.description}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={e => { e.stopPropagation(); handleOpenForm(project); }}><Edit /></IconButton>
                <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(project.id); }}><Delete /></IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>タスク一覧</Typography>
              {tasksByProject[project.id] && tasksByProject[project.id].length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {tasksByProject[project.id].map(task => (
                    <Card key={task.id} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{task.title}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {Array.isArray(task.tags) && task.tags.map((tag, idx) => (
                            <Chip key={idx} label={`#${tag}`} size="small" variant="outlined" color="secondary" />
                          ))}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{task.memo}</Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">このプロジェクトのタスクはありません。</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editProject ? 'プロジェクト編集' : '新規プロジェクト作成'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="プロジェクト名"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            label="説明"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>{editProject ? '更新' : '作成'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 