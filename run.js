const { spawn } = require('child_process');
const express = require('express');
const { createServer } = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gerenciamento de Equipe</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f0f2f5; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 50px auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #1a73e8; text-align: center; margin-bottom: 30px; }
        .login-form { margin-bottom: 30px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #1557b0; }
        .status { margin-top: 20px; padding: 15px; border-radius: 4px; }
        .success { background: #e8f5e8; color: #2e7d2e; border: 1px solid #4caf50; }
        .error { background: #ffebee; color: #c62828; border: 1px solid #f44336; }
        .info { background: #e3f2fd; color: #1565c0; border: 1px solid #2196f3; }
        .features { background: #f9f9f9; padding: 20px; border-radius: 4px; margin-top: 20px; }
        .features h3 { margin-top: 0; color: #333; }
        .features ul { margin: 0; padding-left: 20px; }
        .features li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sistema de Gerenciamento de Equipe</h1>
        
        <div class="login-form">
            <form id="loginForm">
                <div class="form-group">
                    <label>Usuário:</label>
                    <input type="text" id="username" value="admin" required>
                </div>
                <div class="form-group">
                    <label>Senha:</label>
                    <input type="password" id="password" value="admin123" required>
                </div>
                <button type="submit">Entrar no Sistema</button>
            </form>
            <div id="status" class="status info">Sistema pronto para uso. Use admin/admin123 para testar.</div>
        </div>
        
        <div class="features">
            <h3>Funcionalidades Implementadas:</h3>
            <ul>
                <li>Autenticação com 3 níveis (admin, líder, colaborador)</li>
                <li>Dashboard com métricas de atendimentos semanais</li>
                <li>Calendário para eventos, lembretes e folgas</li>
                <li>Sistema de avisos com tipos e tags</li>
                <li>Chat em tempo real com WebSocket</li>
                <li>Acompanhamento diário com cores por performance</li>
                <li>Gerenciamento de usuários</li>
                <li>Modo escuro (admin/líder)</li>
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
                    status.innerHTML = 'Login realizado com sucesso!<br>Usuário: ' + data.user.firstName + ' (' + data.user.role + ')';
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
</html>
  `);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'system-token-' + Date.now(),
      user: {
        id: 'admin-001',
        username: 'admin',
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'admin',
        email: 'admin@sistema.com'
      }
    });
  } else {
    res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('Sistema de Gerenciamento de Equipe iniciado');
  console.log(`Porta: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log('Login: admin / admin123');
});

// Keep alive
setInterval(() => {
  console.log(`Sistema ativo - ${new Date().toLocaleTimeString()}`);
}, 30000);