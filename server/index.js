const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Basic routes for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sistema de Gerenciamento de Equipe</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 400px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .form-group { margin: 20px 0; }
        label { display: block; margin-bottom: 5px; color: #555; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .status { margin-top: 20px; padding: 10px; border-radius: 4px; text-align: center; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Sistema de Gerenciamento de Equipe</h1>
        <form id="loginForm">
          <div class="form-group">
            <label>Usuário:</label>
            <input type="text" id="username" value="admin" required>
          </div>
          <div class="form-group">
            <label>Senha:</label>
            <input type="password" id="password" value="admin123" required>
          </div>
          <button type="submit">Entrar</button>
        </form>
        <div id="status"></div>
      </div>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          const status = document.getElementById('status');
          
          try {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
              const data = await response.json();
              status.innerHTML = '<div class="success">Login realizado com sucesso! Sistema funcionando corretamente.</div>';
            } else {
              const error = await response.json();
              status.innerHTML = '<div class="error">Erro: ' + error.message + '</div>';
            }
          } catch (error) {
            status.innerHTML = '<div class="error">Erro de conexão: ' + error.message + '</div>';
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'demo-token',
      user: {
        id: 'admin-001',
        username: 'admin',
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'admin',
        email: 'admin@empresa.com'
      }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket');
  ws.on('close', () => console.log('WebSocket desconectado'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sistema de Gerenciamento de Equipe rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Login: admin / admin123`);
});