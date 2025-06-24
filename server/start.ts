import express from "express";
import { createServer } from "vite";
import { registerRoutes } from "./routes";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    // Configure routes
    const server = await registerRoutes(app);
    
    // Setup Vite in development mode
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.resolve(process.cwd(), 'client'),
        resolve: {
          alias: {
            "@": path.resolve(process.cwd(), "./client/src"),
            "@shared": path.resolve(process.cwd(), "./shared"),
          },
        },
      });
      
      app.use(vite.ssrFixStacktrace);
      app.use(vite.middlewares);
    } else {
      // Serve static files in production
      app.use(express.static(path.resolve(process.cwd(), 'client/dist')));
      
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(process.cwd(), 'client/dist/index.html'));
      });
    }
    
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Sistema de Gerenciamento de Equipe rodando na porta ${PORT}`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
      console.log(`👤 Login: admin / admin123`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();