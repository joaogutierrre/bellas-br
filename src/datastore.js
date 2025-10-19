const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = { models: [], config: { createdAt: new Date().toISOString() } };
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
      createdAt: now,
      updatedAt: now,
    };
    db.models.push(model);
    writeDB(db);
    return model;
  }
}

module.exports = { DataStore };
