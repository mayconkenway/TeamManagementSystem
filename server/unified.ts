import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { registerRoutes } from "./routes";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

async function startUnifiedServer() {
  try {
    // Register API routes first
    await registerRoutes(app);

    // Create HTTP server
    const httpServer = createServer(app);

    // Add WebSocket server for chat
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    wss.on('connection', (ws: WebSocket) => {
      console.log('Nova conexão WebSocket estabelecida');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          
          // Broadcast message to all connected clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(data));
            }
          });
        } catch (error) {
          console.error('Erro ao processar mensagem WebSocket:', error);
        }
      });

      ws.on('close', () => {
        console.log('Conexão WebSocket fechada');
      });
    });

    // Serve static files for the frontend
    const clientPath = path.resolve(process.cwd(), 'client');
    app.use(express.static(clientPath));

    // Catch-all handler for SPA routing - must be last
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(clientPath, 'index.html'));
      }
    });

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Sistema de Gerenciamento de Equipe rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
      console.log(`Login: admin / admin123`);
    });

  } catch (error) {
    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startUnifiedServer();