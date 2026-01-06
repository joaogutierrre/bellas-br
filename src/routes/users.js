const express = require('express');
const { DataStore } = require('../datastore');
const { authenticateToken, checkRole, generateToken, authenticateUser } = require('../middleware/auth');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, password' });
  }
  
  // Check if user already exists
  const existingUser = DataStore.getUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já cadastrado com este email' });
  }
  
  // Create user
  const user = DataStore.createUser({ name, email, password, role });
  
  // Generate token
  const token = generateToken(user);
  
  res.status(201).json({ 
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  });
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Campos obrigatórios: email, password' });
  }
  
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  const token = generateToken(user);
  
  res.json({ 
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  });
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const user = DataStore.getUserById(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  const { password, ...userWithoutPassword } = user;
  res.json({ data: userWithoutPassword });
});

// Update user profile
router.put('/me', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const updates = req.body;
  
  // Don't allow role or email changes through this endpoint
  delete updates.role;
  delete updates.email;
  
  const updatedUser = DataStore.updateUser(userId, updates);
  if (!updatedUser) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  const { password, ...userWithoutPassword } = updatedUser;
  res.json({ data: userWithoutPassword });
});

// Favorite management
router.post('/me/favorites/:modelId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const modelId = req.params.modelId;
  
  const updatedUser = DataStore.addFavorite(userId, modelId);
  if (!updatedUser) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  res.json({ data: { favorites: updatedUser.favorites } });
});

router.delete('/me/favorites/:modelId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const modelId = req.params.modelId;
  
  const updatedUser = DataStore.removeFavorite(userId, modelId);
  if (!updatedUser) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  res.json({ data: { favorites: updatedUser.favorites } });
});

// Admin routes
router.get('/admin/users', authenticateToken, checkRole('superadmin'), (req, res) => {
  const users = DataStore.getAllUsers();
  const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
  res.json({ data: usersWithoutPasswords });
});

router.get('/admin/models', authenticateToken, checkRole('superadmin'), (req, res) => {
  const models = DataStore.getAllModels();
  res.json({ data: models });
});

router.get('/admin/users/:id', authenticateToken, checkRole('superadmin'), (req, res) => {
  const user = DataStore.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  const { password, ...userWithoutPassword } = user;
  res.json({ data: userWithoutPassword });
});

router.get('/admin/models/:id', authenticateToken, checkRole('superadmin'), (req, res) => {
  const model = DataStore.getModelById(req.params.id);
  if (!model) return res.status(404).json({ error: 'Modelo não encontrado' });
  res.json({ data: model });
});

router.put('/admin/users/:id', authenticateToken, checkRole('superadmin'), (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  
  const updatedUser = DataStore.updateUser(userId, updates);
  if (!updatedUser) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  const { password, ...userWithoutPassword } = updatedUser;
  res.json({ data: userWithoutPassword });
});

router.put('/admin/models/:id', authenticateToken, checkRole('superadmin'), (req, res) => {
  const modelId = req.params.id;
  const updates = req.body;
  
  const updatedModel = DataStore.updateModel(modelId, updates);
  if (!updatedModel) return res.status(404).json({ error: 'Modelo não encontrado' });
  
  res.json({ data: updatedModel });
});

router.delete('/admin/users/:id', authenticateToken, checkRole('superadmin'), (req, res) => {
  const success = DataStore.deleteUser(req.params.id);
  if (!success) return res.status(404).json({ error: 'Usuário não encontrado' });
  
  res.json({ success: true });
});

router.delete('/admin/models/:id', authenticateToken, checkRole('superadmin'), (req, res) => {
  const success = DataStore.deleteModel(req.params.id);
  if (!success) return res.status(404).json({ error: 'Modelo não encontrado' });
  
  res.json({ success: true });
});

// Create initial superadmin (for setup)
router.post('/admin/setup', async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, password' });
  }
  
  // Check if any superadmin already exists
  const users = DataStore.getAllUsers();
  const superadminExists = users.some(user => user.role === 'superadmin');
  
  if (superadminExists) {
    return res.status(400).json({ error: 'Superadmin já existe. Não é possível criar outro.' });
  }
  
  // Create superadmin
  const superadmin = DataStore.createUser({ 
    name, 
    email, 
    password, 
    role: 'superadmin' 
  });
  
  const token = generateToken(superadmin);
  
  res.status(201).json({ 
    user: { id: superadmin.id, name: superadmin.name, email: superadmin.email, role: superadmin.role },
    token,
    message: 'Superadmin criado com sucesso'
  });
});

module.exports = router;