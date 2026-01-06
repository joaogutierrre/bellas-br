const jwt = require('jsonwebtoken');
const { DataStore } = require('../datastore');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
}

function checkRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Usuário não autenticado' });
    
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Acesso negado: função insuficiente' });
    }
    
    next();
  };
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function authenticateUser(email, password) {
  const user = DataStore.getUserByEmail(email);
  if (!user) return null;
  
  // In production, compare hashed passwords
  if (user.password === password) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}

module.exports = {
  authenticateToken,
  checkRole,
  generateToken,
  authenticateUser,
  JWT_SECRET
};