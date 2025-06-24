import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { authenticateToken, authorizeRoles, generateToken, comparePassword, type AuthRequest } from "./auth";
import { insertUserSchema, insertCalendarEventSchema, insertNoticeSchema, insertNoticeTypeSchema, insertNoticeTagSchema, insertChatMessageSchema, insertDailyTrackingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
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

  // User management routes
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

  app.post("/api/users", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "Erro ao criar usuário" });
    }
  });

  // Calendar routes
  app.get("/api/calendar", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const events = await storage.getCalendarEvents(req.user!.id);
      res.json(events);
    } catch (error) {
      console.error("Get calendar events error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/calendar", authenticateToken, authorizeRoles("admin", "lider"), async (req: AuthRequest, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      const event = await storage.createCalendarEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Create calendar event error:", error);
      res.status(500).json({ message: "Erro ao criar evento" });
    }
  });

  // Notice routes
  app.get("/api/notices", authenticateToken, async (req, res) => {
    try {
      const notices = await storage.getNotices();
      res.json(notices);
    } catch (error) {
      console.error("Get notices error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/notices", authenticateToken, authorizeRoles("admin", "lider"), async (req: AuthRequest, res) => {
    try {
      const noticeData = insertNoticeSchema.parse({
        ...req.body,
        createdBy: req.user!.id,
      });
      const notice = await storage.createNotice(noticeData);
      res.status(201).json(notice);
    } catch (error) {
      console.error("Create notice error:", error);
      res.status(500).json({ message: "Erro ao criar aviso" });
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

  app.post("/api/notice-types", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
      const typeData = insertNoticeTypeSchema.parse(req.body);
      const type = await storage.createNoticeType(typeData);
      res.status(201).json(type);
    } catch (error) {
      console.error("Create notice type error:", error);
      res.status(500).json({ message: "Erro ao criar tipo de aviso" });
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

  app.post("/api/notice-tags", authenticateToken, authorizeRoles("admin"), async (req, res) => {
    try {
      const tagData = insertNoticeTagSchema.parse(req.body);
      const tag = await storage.createNoticeTag(tagData);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Create notice tag error:", error);
      res.status(500).json({ message: "Erro ao criar tag" });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get chat messages error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/chat/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const message = await storage.createChatMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Create chat message error:", error);
      res.status(500).json({ message: "Erro ao enviar mensagem" });
    }
  });

  app.get("/api/chat/settings", authenticateToken, async (req, res) => {
    try {
      const settings = await storage.getChatSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get chat settings error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/chat/settings", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
    try {
      const settings = await storage.updateChatSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Update chat settings error:", error);
      res.status(500).json({ message: "Erro ao atualizar configurações" });
    }
  });

  // Daily tracking routes
  app.get("/api/daily-tracking", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
    try {
      const date = req.query.date as string;
      const tracking = await storage.getDailyTracking(date);
      res.json(tracking);
    } catch (error) {
      console.error("Get daily tracking error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/daily-tracking", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
    try {
      const trackingData = insertDailyTrackingSchema.parse(req.body);
      const tracking = await storage.createDailyTracking(trackingData);
      res.status(201).json(tracking);
    } catch (error) {
      console.error("Create daily tracking error:", error);
      res.status(500).json({ message: "Erro ao criar registro" });
    }
  });

  app.put("/api/daily-tracking/:id", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
    try {
      const { id } = req.params;
      const tracking = await storage.updateDailyTracking(id, req.body);
      res.json(tracking);
    } catch (error) {
      console.error("Update daily tracking error:", error);
      res.status(500).json({ message: "Erro ao atualizar registro" });
    }
  });

  // App settings routes
  app.get("/api/settings", authenticateToken, async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      console.error("Get app settings error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.put("/api/settings", authenticateToken, authorizeRoles("admin", "lider"), async (req, res) => {
    try {
      const settings = await storage.updateAppSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Update app settings error:", error);
      res.status(500).json({ message: "Erro ao atualizar configurações" });
    }
  });

  // Routes registered successfully
}