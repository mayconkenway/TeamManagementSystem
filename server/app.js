const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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

// Serve HTML page
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
        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        h1 { color: #333; text-align: center; margin-bottom: 30px; font-size: 24px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #555; font-weight: 500; }
        input { width: 100%; padding: 12px; border: 2px solid #e1e5e9; border-radius: 6px; font-size: 16px; transition: border-color 0.3s; }
        input:focus { outline: none; border-color: #667eea; }
        button { width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s; }
        button:hover { transform: translateY(-2px); }
        button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .status { margin-top: 20px; padding: 12px; border-radius: 6px; text-align: center; font-weight: 500; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .features { margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 6px; }
        .features h3 { color: #495057; margin-bottom: 10px; font-size: 16px; }
        .features ul { list-style: none; }
        .features li { padding: 3px 0; color: #6c757d; font-size: 14px; }
        .features li:before { content: "✓ "; color: #28a745; font-weight: bold; }
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
            <button type="submit" id="loginBtn">Entrar no Sistema</button>
        </form>
        <div id="status"></div>
        
        <div class="features">
            <h3>Funcionalidades do Sistema:</h3>
            <ul>
                <li>Dashboard com métricas semanais</li>
                <li>Calendário de eventos e folgas</li>
                <li>Sistema de avisos</li>
                <li>Chat em tempo real</li>
                <li>Acompanhamento diário</li>
                <li>Gerenciamento de usuários</li>
                <li>Modo escuro</li>
            </ul>
        </div>
    </div>
    
    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const status = document.getElementById('status');
            const btn = document.getElementById('loginBtn');
            
            btn.disabled = true;
            btn.textContent = 'Conectando...';
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    status.innerHTML = '<div class="success">Login realizado com sucesso! Sistema funcionando corretamente.<br>Usuário: ' + data.user.firstName + ' (' + data.user.role + ')</div>';
                } else {
                    const error = await response.json();
                    status.innerHTML = '<div class="error">Erro: ' + error.message + '</div>';
                }
            } catch (error) {
                status.innerHTML = '<div class="error">Erro de conexão: ' + error.message + '</div>';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Entrar no Sistema';
            }
        });
        
        // Mostrar status inicial
        document.getElementById('status').innerHTML = '<div class="info">Sistema pronto para uso. Use as credenciais padrão para testar.</div>';
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

// Outras rotas da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    features: [
      'Dashboard com métricas semanais',
      'Calendário de eventos',
      'Sistema de avisos',
      'Chat em tempo real',
      'Acompanhamento diário',
      'Gerenciamento de usuários'
    ]
  });
});

// Servidor HTTP
const server = createServer(app);

// WebSocket para chat
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket estabelecida');
  
  ws.on('message', (message) => {
    console.log('Mensagem recebida:', message.toString());
    // Broadcast para todos os clientes conectados
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('Conexão WebSocket fechada');
  });
});

// Iniciar servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('Sistema de Gerenciamento de Equipe');
  console.log('='.repeat(50));
  console.log(`Servidor rodando na porta: ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Login: admin / admin123`);
  console.log('='.repeat(50));
});

// Manter o processo ativo
process.on('SIGTERM', () => {
  console.log('Servidor finalizando...');
  server.close(() => {
    console.log('Servidor fechado');
  });
});

process.on('SIGINT', () => {
  console.log('Servidor finalizando...');
  server.close(() => {
    console.log('Servidor fechado');
  });
});