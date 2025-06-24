import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { authenticateToken, authorizeRoles, generateToken, comparePassword, type AuthRequest } from "./auth";
import { insertUserSchema, insertCalendarEventSchema, insertNoticeSchema, insertNoticeTypeSchema, insertNoticeTagSchema, insertChatMessageSchema, insertDailyTrackingSchema } from "@shared/schema";
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

// Auth routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username e senha são obrigatórios" });
    }

    const user = await storage.getUserByUsername(username);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/api/auth/user", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Basic API routes
app.get("/api/users", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })));
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/api/notices", authenticateToken, async (req, res) => {
  try {
    const notices = await storage.getNotices();
    res.json(notices);
  } catch (error) {
    console.error("Get notices error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/api/calendar", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const events = await storage.getCalendarEvents(req.user!.id);
    res.json(events);
  } catch (error) {
    console.error("Get calendar events error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/api/notice-types", authenticateToken, async (req, res) => {
  try {
    const types = await storage.getNoticeTypes();
    res.json(types);
  } catch (error) {
    console.error("Get notice types error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

app.get("/api/notice-tags", authenticateToken, async (req, res) => {
  try {
    const tags = await storage.getNoticeTags();
    res.json(tags);
  } catch (error) {
    console.error("Get notice tags error:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
});

// Serve static files
const clientPath = path.resolve(process.cwd(), 'client');
app.use(express.static(clientPath));

// Create HTTP server
const httpServer = createServer(app);

// Add WebSocket server
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('Nova conexão WebSocket estabelecida');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      
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

// SPA routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    res.sendFile(path.join(clientPath, 'index.html'));
  }
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Sistema de Gerenciamento de Equipe rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
  console.log(`Login: admin / admin123`);
});