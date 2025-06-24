// api/index.js
import express from 'express';
import serverless from 'serverless-http'; // Responsável por transformar o Express em Serverless

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

// Rota principal para servir a aplicação (servindo HTML simples)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gerenciamento de Equipe</title>
    <style>
        /* Estilo do HTML conforme o seu código */
    </style>
</head>
<body>
    <div class="container">
        <h1>Sistema de Gerenciamento de Equipe</h1>
        <div class="status">
            Sistema hospedado no Vercel - Online e funcionando!
        </div>
        
        <!-- Formulário de login e outras funcionalidades -->
    </div>
    <script>
        // Seu código JS para interagir com a API
    </script>
</body>
</html>
  `);
});

// API de autenticação
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'admin123') {
    return res.json({
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
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
});

// API de status
app.get('/api/status', (req, res) => {
  return res.json({
    status: 'online',
    platform: 'Vercel',
    timestamp: new Date().toISOString(),
    features: 'Sistema completo de gerenciamento de equipe'
  });
});

// Outras APIs básicas
app.get('/api/users', (req, res) => {
  return res.json([
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
  return res.json([
    {
      id: 'notice-001',
      title: 'Sistema Implantado',
      content: 'Sistema de gerenciamento de equipe foi implantado com sucesso no Vercel.',
      createdAt: new Date().toISOString()
    }
  ]);
});

// Exportando para o Vercel como uma função serverless
export const handler = serverless(app);
