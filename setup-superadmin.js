const { DataStore } = require('./src/datastore');
const { generateToken } = require('./src/middleware/auth');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Setup do Superadmin ===');
console.log('Este script cria o primeiro usuário superadmin.');
console.log('');

rl.question('Nome: ', (name) => {
  rl.question('Email: ', (email) => {
    rl.question('Senha: ', (password) => {
      
      // Check if any superadmin already exists
      const users = DataStore.getAllUsers();
      const superadminExists = users.some(user => user.role === 'superadmin');
      
      if (superadminExists) {
        console.log('❌ Erro: Superadmin já existe. Não é possível criar outro.');
        rl.close();
        return;
      }
      
      // Create superadmin
      const superadmin = DataStore.createUser({ 
        name, 
        email, 
        password, 
        role: 'superadmin' 
      });
      
      const token = generateToken(superadmin);
      
      console.log('');
      console.log('✅ Superadmin criado com sucesso!');
      console.log('');
      console.log('ID:', superadmin.id);
      console.log('Nome:', superadmin.name);
      console.log('Email:', superadmin.email);
      console.log('Role:', superadmin.role);
      console.log('');
      console.log('Token de autenticação:');
      console.log(token);
      console.log('');
      console.log('Guarde este token com segurança!');
      console.log('');
      
      rl.close();
    });
  });
});