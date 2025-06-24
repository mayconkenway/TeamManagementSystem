# Sistema de Gerenciamento de Equipe

## Overview

Sistema completo de gerenciamento de equipe com autenticação baseada em cargos (admin, líder, colaborador). Inclui funcionalidades de calendário, avisos, chat em tempo real, acompanhamento diário de produtividade e gerenciamento de usuários.

## System Architecture

### Current State
- **Status**: Sistema completo implementado e funcional
- **Structure**: Aplicação full-stack com React frontend e Express backend
- **Technology Stack**: React, TypeScript, Express, PostgreSQL, WebSocket, Tailwind CSS

### Architecture Details
- **Frontend**: React 18 com TypeScript, Wouter para roteamento, TanStack Query para gerenciamento de estado
- **Backend**: Express.js com TypeScript, autenticação JWT, WebSocket para chat em tempo real
- **Database**: PostgreSQL com Drizzle ORM
- **Styling**: Tailwind CSS com modo escuro
- **Real-time**: WebSocket para chat em tempo real

## Key Components

### Authentication System
- Sistema de login com JWT tokens
- Três níveis de permissão: admin, líder, colaborador
- Middleware de autorização baseado em roles

### Dashboard
- Visão geral com estatísticas do sistema
- Métricas de avisos, eventos, usuários e atendimentos semanais
- Interface adaptativa baseada no papel do usuário

### Calendar Module
- Criação de eventos, lembretes e folgas
- Atribuição de eventos para usuários específicos ou todos
- Visualização filtrada por permissões

### Notices System
- Sistema de avisos com tipos e tags customizáveis
- Controle de prazos e renovações
- Gerenciamento de tipos de aviso (apenas admin)

### Real-time Chat
- Chat em tempo real com WebSocket
- Suporte a emojis e mensagens prioritárias
- Controle de pausa do chat (líder/admin)
- Edição e remoção de mensagens

### Daily Tracking
- Acompanhamento diário de colaboradores
- Registro de status (trabalhou, atestado, férias)
- Controle de atendimentos semanais com indicadores visuais
- Sistema de cores baseado em performance

### User Management
- Criação e gerenciamento de usuários
- Atribuição de papéis e permissões
- Controle de usuários ativos/inativos

## Data Flow

### Authentication Flow
1. Login via username/password
2. JWT token generation e armazenamento
3. Middleware de autenticação em rotas protegidas
4. Verificação de roles para autorização

### Real-time Communication
1. Conexão WebSocket estabelecida no chat
2. Mensagens broadcast para todos os clientes conectados
3. Invalidação de cache para atualizações em tempo real

### Data Persistence
1. Operações CRUD via API REST
2. Validação com Zod schemas
3. Transações de banco via Drizzle ORM
4. Cache invalidation com TanStack Query

## External Dependencies

### Core Dependencies
- **React**: Framework frontend
- **Express**: Servidor web
- **PostgreSQL**: Banco de dados principal
- **Drizzle ORM**: Object-relational mapping
- **JWT**: Autenticação
- **WebSocket**: Comunicação em tempo real
- **Tailwind CSS**: Framework de estilo

### Development Tools
- **TypeScript**: Type safety
- **Vite**: Build tool e desenvolvimento
- **TSX**: TypeScript execution

## Deployment Strategy

### Current Configuration
- **Platform**: Replit com PostgreSQL integrado
- **Environment**: Variáveis de ambiente para DATABASE_URL
- **Build**: Vite para frontend, TSX para backend
- **Port**: Servidor rodando na porta 3000

### Security Considerations
- **Password Hashing**: bcryptjs para senhas
- **JWT Secrets**: Configuração via variáveis de ambiente
- **Database**: Constraints de foreign key implementadas
- **Authorization**: Middleware baseado em roles

## User Credentials

### Default Admin User
- **Username**: admin
- **Password**: admin123
- **Role**: admin
- **Permissions**: Acesso total ao sistema

## Changelog

```
Changelog:
- June 24, 2025: Sistema completo de gerenciamento implementado
  • Sistema de autenticação com 3 níveis (admin/líder/colaborador)
  • Dashboard com estatísticas e métricas
  • Calendário com eventos e folgas
  • Sistema de avisos com tipos e tags
  • Chat em tempo real com WebSocket
  • Acompanhamento diário com métricas de atendimento semanal
  • Gerenciamento de usuários
  • Modo escuro
  • Database setup com usuário admin padrão
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## Notes

- Sistema implementado com todas as funcionalidades solicitadas
- Dashboard configurado para mostrar atendimentos semanais conforme solicitação do usuário
- Todas as permissões e funcionalidades funcionando conforme especificado
- Problema de inicialização resolvido - servidor configurado para rodar estável na porta 3000
- Interface web funcionando com login admin/admin123

---

**Note**: This documentation will be updated as the project develops. The current minimal state provides a foundation for future architectural decisions and implementation details.