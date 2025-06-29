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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../components/Auth/AuthProvider';
import { initFirebase } from '../firebase';

export default function ProjectListPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

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

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">プロジェクト一覧</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenForm()}>新規作成</Button>
      </Box>
      <List>
        {projects.map(project => (
          <ListItem key={project.id} divider>
            <ListItemText
              primary={project.name}
              secondary={project.description}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleOpenForm(project)}><Edit /></IconButton>
              <IconButton edge="end" color="error" onClick={() => handleDelete(project.id)}><Delete /></IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
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