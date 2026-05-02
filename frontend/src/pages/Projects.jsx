import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({ name: '', description: '', members: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/auth/users')
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setShowModal(false);
      setFormData({ name: '', description: '', members: [] });
      toast.success('Project created successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleMemberSelection = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({...formData, members: value});
  };

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{height: '40px', width: '200px', marginBottom: '2rem'}}></div>
      <div className="projects-grid">
        {[1,2,3].map(i => <div key={i} className="project-card skeleton" style={{height: '150px'}}></div>)}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header flex-between">
        <div>
          <h1>Projects</h1>
          <p>Manage your team's projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary flex-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </header>

      <div className="projects-grid">
        {projects.length === 0 && <p className="empty-state">No projects found.</p>}
        {projects.map(project => (
          <div key={project._id} className="project-card">
            <div className="flex-between" style={{ alignItems: 'flex-start' }}>
              <h3>{project.name}</h3>
              {user?.role === 'Admin' && (
                <button 
                  onClick={() => handleDelete(project._id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="project-desc">{project.description}</p>
            <div className="project-footer">
              <div className="members-avatars">
                <Users size={16} className="text-gray" />
                <span>{project.members?.length || 0} members</span>
              </div>
              <span className="date-label">{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
              </div>
              <div className="form-group">
                <label>Assign Members</label>
                <select multiple value={formData.members} onChange={handleMemberSelection} className="multi-select">
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <small className="text-gray">Hold Ctrl/Cmd to select multiple</small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
