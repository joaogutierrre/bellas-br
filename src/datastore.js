const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = { 
      models: [], 
      users: [], 
      config: { createdAt: new Date().toISOString() } 
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
  }
}

function readDB() {
  ensureDataFile();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

class DataStore {
  static getAllModels({ active } = {}) {
    const db = readDB();
    let models = db.models;
    if (typeof active === 'boolean') {
      models = models.filter((m) => m.isActive === active);
    }
    return models;
  }

  static getModelById(id) {
    const db = readDB();
    return db.models.find((m) => m.id === id) || null;
  }

  static upsertModel(model) {
    const db = readDB();
    const idx = db.models.findIndex((m) => m.id === model.id);
    if (idx >= 0) {
      db.models[idx] = model;
    } else {
      db.models.push(model);
    }
    writeDB(db);
    return model;
  }

  static updateModel(id, patch) {
   const db = readDB();
   const model = db.models.find((m) => m.id === id);
   if (!model) return null;
   const updated = { ...model, ...patch, updatedAt: new Date().toISOString() };
   const idx = db.models.findIndex((m) => m.id === id);
   db.models[idx] = updated;
   writeDB(db);
   return updated;
  }

  static createModel(data) {
   const db = readDB();
   const { v4: uuidv4 } = require('uuid');
   const now = new Date().toISOString();
   const model = {
     id: uuidv4(),
     name: data.name || 'Modelo',
     description: data.description || '',
     services: data.services || [],
     phone: data.phone || '',
     location: data.location || 'Brasília',
     pricePerHour: data.pricePerHour || null,
     photos: data.photos || [],
     videos: data.videos || [],
     isActive: false, // começa desativado até pagamento
     paidUntil: null,
     stripeCustomerId: null,
     stripeSubscriptionId: null,
     paymentStatus: 'unpaid',
     role: 'model', // Add role field
     createdAt: now,
     updatedAt: now,
   };
   db.models.push(model);
   writeDB(db);
   return model;
  }

  // User management methods
  static getAllUsers() {
   const db = readDB();
   return db.users;
  }

  static getUserById(id) {
   const db = readDB();
   return db.users.find((u) => u.id === id) || null;
  }

  static getUserByEmail(email) {
   const db = readDB();
   return db.users.find((u) => u.email === email) || null;
  }

  static createUser(data) {
   const db = readDB();
   const { v4: uuidv4 } = require('uuid');
   const now = new Date().toISOString();
   const user = {
     id: uuidv4(),
     name: data.name || 'Usuário',
     email: data.email,
     password: data.password, // In production, this should be hashed
     role: data.role || 'user',
     favorites: data.favorites || [],
     createdAt: now,
     updatedAt: now,
   };
   db.users.push(user);
   writeDB(db);
   return user;
  }

  static updateUser(id, patch) {
   const db = readDB();
   const user = db.users.find((u) => u.id === id);
   if (!user) return null;
   const updated = { ...user, ...patch, updatedAt: new Date().toISOString() };
   const idx = db.users.findIndex((u) => u.id === id);
   db.users[idx] = updated;
   writeDB(db);
   return updated;
  }

  static deleteUser(id) {
   const db = readDB();
   const idx = db.users.findIndex((u) => u.id === id);
   if (idx === -1) return false;
   db.users.splice(idx, 1);
   writeDB(db);
   return true;
  }

  static deleteModel(id) {
   const db = readDB();
   const idx = db.models.findIndex((m) => m.id === id);
   if (idx === -1) return false;
   db.models.splice(idx, 1);
   writeDB(db);
   return true;
  }

  // Favorite management
  static addFavorite(userId, modelId) {
   const user = DataStore.getUserById(userId);
   if (!user) return null;

   if (!user.favorites.includes(modelId)) {
     user.favorites.push(modelId);
     return DataStore.updateUser(userId, { favorites: user.favorites });
   }
   return user;
  }

  static removeFavorite(userId, modelId) {
   const user = DataStore.getUserById(userId);
   if (!user) return null;

   const updatedFavorites = user.favorites.filter(id => id !== modelId);
   return DataStore.updateUser(userId, { favorites: updatedFavorites });
  }

  // Admin methods to get all entities
  static getAllEntities() {
   const db = readDB();
   return {
     models: db.models,
     users: db.users
   };
  }
  }

module.exports = { DataStore };
