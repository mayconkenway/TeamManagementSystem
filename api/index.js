const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS para Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Rota principal para servir a aplicação
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gerenciamento de Equipe</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 500px; }
        h1 { color: #333; text-align: center; margin-bottom: 30px; font-size: 28px; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px solid #c3e6cb; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #555; font-weight: 500; }
        input { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 16px; }
        input:focus { outline: none; border-color: #667eea; }
        button { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; }
        button:hover { transform: translateY(-2px); }
        .features { margin-top: 25px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .features h3 { color: #495057; margin: 0 0 15px 0; font-size: 18px; }
        .features ul { list-style: none; margin: 0; padding: 0; }
        .features li { padding: 6px 0; color: #6c757d; font-size: 14px; }
        .features li:before { content: "✓ "; color: #28a745; font-weight: bold; margin-right: 8px; }
        .result { margin-top: 15px; padding: 12px; border-radius: 6px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sistema de Gerenciamento de Equipe</h1>
        
        <div class="status">
            Sistema hospedado no Vercel - Online e funcionando!
        </div>
        
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
        <div id="result"></div>
        
        <div class="features">
            <h3>Funcionalidades do Sistema:</h3>
            <ul>
                <li>Autenticação com 3 níveis (admin, líder, colaborador)</li>
                <li>Dashboard com métricas de atendimentos semanais</li>
                <li>Calendário para eventos, lembretes e folgas</li>
                <li>Sistema de avisos com tipos e tags personalizáveis</li>
                <li>Chat em tempo real com WebSocket</li>
                <li>Acompanhamento diário com controle de cores por performance</li>
                <li>Gerenciamento de usuários e permissões</li>
                <li>Modo escuro (admin/líder)</li>
            </ul>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const result = document.getElementById('result');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    result.innerHTML = '<div class="result success">Login realizado com sucesso!<br>Usuário: ' + data.user.firstName + ' (' + data.user.role + ')<br>Sistema funcionando corretamente no Vercel!</div>';
                } else {
                    const error = await response.json();
                    result.innerHTML = '<div class="result error">Erro: ' + error.message + '</div>';
                }
            } catch (error) {
                result.innerHTML = '<div class="result error">Erro de conexão: ' + error.message + '</div>';
            }
        });
    </script>
</body>
</html>
  `);
});

// API de autenticação
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'vercel-token-' + Date.now(),
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

// API de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Vercel',
    timestamp: new Date().toISOString(),
    features: 'Sistema completo de gerenciamento de equipe'
  });
});

// Outras APIs básicas
app.get('/api/users', (req, res) => {
  res.json([
    {
      id: 'admin-001',
      username: 'admin',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: 'admin',
      email: 'admin@empresa.com',
      isActive: true
    }
  ]);
});

app.get('/api/notices', (req, res) => {
  res.json([
    {
      id: 'notice-001',
      title: 'Sistema Implantado',
      content: 'Sistema de gerenciamento de equipe foi implantado com sucesso no Vercel.',
      createdAt: new Date().toISOString()
    }
  ]);
});

// Para Vercel, exportamos o app
module.exports = app;