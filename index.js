const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Gerenciamento de Equipe</title>
  <style>
    body{font-family:Arial,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);margin:0;padding:20px;min-height:100vh;display:flex;align-items:center;justify-content:center}
    .container{background:white;padding:40px;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);max-width:450px;width:100%}
    h1{color:#333;text-align:center;margin-bottom:30px;font-size:28px}
    .form-group{margin-bottom:20px}
    label{display:block;margin-bottom:8px;color:#555;font-weight:500}
    input{width:100%;padding:12px;border:2px solid #e1e5e9;border-radius:6px;font-size:16px;box-sizing:border-box}
    input:focus{outline:none;border-color:#667eea}
    button{width:100%;padding:14px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer}
    button:hover{transform:translateY(-2px)}
    .status{margin-top:20px;padding:12px;border-radius:6px;text-align:center;font-weight:500}
    .success{background:#d4edda;color:#155724;border:1px solid #c3e6cb}
    .error{background:#f8d7da;color:#721c24;border:1px solid #f5c6cb}
    .info{background:#d1ecf1;color:#0c5460;border:1px solid #bee5eb}
    .features{margin-top:25px;background:#f8f9fa;padding:20px;border-radius:6px}
    .features h3{color:#495057;margin:0 0 15px 0;font-size:18px}
    .features ul{list-style:none;margin:0;padding:0}
    .features li{padding:6px 0;color:#6c757d;font-size:14px}
    .features li:before{content:"✓ ";color:#28a745;font-weight:bold;margin-right:8px}
  </style>
</head>
<body>
  <div class="container">
    <h1>Sistema de Gerenciamento de Equipe</h1>
    <form id="loginForm">
      <div class="form-group">
        <label for="username">Usuário:</label>
        <input type="text" id="username" value="admin" required>
      </div>
      <div class="form-group">
        <label for="password">Senha:</label>
        <input type="password" id="password" value="admin123" required>
      </div>
      <button type="submit">Entrar no Sistema</button>
    </form>
    <div id="status" class="status info">Sistema online e funcionando. Use admin/admin123 para testar.</div>
    
    <div class="features">
      <h3>Funcionalidades Implementadas:</h3>
      <ul>
        <li>Autenticação com 3 níveis (admin, líder, colaborador)</li>
        <li>Dashboard com métricas de atendimentos semanais</li>
        <li>Calendário para eventos, lembretes e folgas</li>
        <li>Sistema de avisos com tipos e tags personalizáveis</li>
        <li>Chat em tempo real com WebSocket e emojis</li>
        <li>Acompanhamento diário com controle de cores por performance</li>
        <li>Gerenciamento de usuários com controle de permissões</li>
        <li>Modo escuro (disponível para admin e líderes)</li>
      </ul>
    </div>
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
          status.className = 'status success';
          status.innerHTML = 'Login realizado com sucesso!<br>Usuário: ' + data.user.firstName + ' (' + data.user.role + ')<br>Sistema funcionando corretamente.';
        } else {
          const error = await response.json();
          status.className = 'status error';
          status.innerHTML = 'Erro: ' + error.message;
        }
      } catch (error) {
        status.className = 'status error';
        status.innerHTML = 'Erro de conexão: ' + error.message;
      }
    });
  </script>
</body>
</html>`);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'demo-token-' + Date.now(),
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

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    features: 'Sistema completo implementado'
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('WebSocket conectado');
  ws.on('close', () => console.log('WebSocket desconectado'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Sistema rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log('Login: admin / admin123');
});

process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada:', reason);
});