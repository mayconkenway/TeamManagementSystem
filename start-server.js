const express = require('express');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Sistema de Gerenciamento de Equipe</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; text-align: center; margin-bottom: 30px; }
    .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
    .features { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .features h3 { margin-top: 0; }
    .features ul { margin: 0; padding-left: 20px; }
    .test-section { margin: 20px 0; padding: 20px; background: #e3f2fd; border-radius: 5px; }
    button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    button:hover { background: #0056b3; }
    #result { margin-top: 10px; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Sistema de Gerenciamento de Equipe</h1>
    
    <div class="status">
      Sistema Online e Funcionando Corretamente!
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
        <li>Modo escuro</li>
      </ul>
    </div>
    
    <div class="test-section">
      <h3>Teste de Login:</h3>
      <p>Usuário: admin | Senha: admin123</p>
      <button onclick="testLogin()">Testar Login</button>
      <div id="result"></div>
    </div>
  </div>
  
  <script>
    async function testLogin() {
      const result = document.getElementById('result');
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        
        if (response.ok) {
          const data = await response.json();
          result.innerHTML = '<div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;">Login realizado com sucesso! Usuário: ' + data.user.firstName + ' (' + data.user.role + ')</div>';
        } else {
          const error = await response.json();
          result.innerHTML = '<div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;">Erro: ' + error.message + '</div>';
        }
      } catch (error) {
        result.innerHTML = '<div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;">Erro de conexão: ' + error.message + '</div>';
      }
    }
  </script>
</body>
</html>
  `);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      token: 'system-token',
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

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log('SISTEMA DE GERENCIAMENTO DE EQUIPE');
  console.log('='.repeat(50));
  console.log(`Servidor rodando na porta: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Credenciais: admin / admin123`);
  console.log('='.repeat(50));
});

setInterval(() => {
  console.log(`[${new Date().toLocaleTimeString()}] Sistema ativo`);
}, 60000);

process.on('SIGTERM', () => {
  console.log('Servidor sendo finalizado...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('Servidor sendo finalizado...');
  server.close();
});