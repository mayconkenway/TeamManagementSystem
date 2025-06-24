# Sistema de Gerenciamento de Equipe

Sistema completo de gerenciamento de equipe com autenticação baseada em cargos, dashboard de métricas, calendário, avisos e chat em tempo real.

## Funcionalidades

- **Autenticação**: 3 níveis de permissão (admin, líder, colaborador)
- **Dashboard**: Métricas de atendimentos semanais e estatísticas
- **Calendário**: Eventos, lembretes e folgas
- **Avisos**: Sistema de comunicados com tipos e tags
- **Chat**: Comunicação em tempo real com WebSocket
- **Acompanhamento**: Controle diário com cores por performance
- **Usuários**: Gerenciamento completo de membros da equipe
- **Modo Escuro**: Interface adaptável

## Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Git instalado
- Projeto no GitHub (opcional)

### Passos para Deploy

1. **Preparar o projeto**:
   ```bash
   # Certifique-se de que todos os arquivos estão no diretório
   ls -la
   ```

2. **Deploy via Vercel CLI**:
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Fazer login no Vercel
   vercel login
   
   # Deploy do projeto
   vercel
   ```

3. **Deploy via GitHub**:
   - Faça push do projeto para um repositório GitHub
   - Conecte o repositório no dashboard do Vercel
   - Configure o deploy automático

### Configuração no Vercel

- **Build Command**: `npm run build`
- **Output Directory**: `api`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Variáveis de Ambiente (Opcional)

Se você quiser usar banco de dados real no Vercel:

```
DATABASE_URL=sua_url_do_banco
JWT_SECRET=seu_jwt_secret
NODE_ENV=production
```

## Credenciais de Acesso

- **Usuário**: admin
- **Senha**: admin123

## Estrutura do Projeto

```
/
├── api/
│   └── index.js          # Servidor principal para Vercel
├── vercel.json           # Configuração do Vercel
├── package.json          # Dependências e scripts
└── README.md            # Documentação
```

## URLs da API

- `GET /` - Interface principal
- `POST /api/auth/login` - Autenticação
- `GET /api/status` - Status do sistema
- `GET /api/users` - Lista de usuários
- `GET /api/notices` - Lista de avisos

## Suporte

Sistema desenvolvido para gerenciamento completo de equipes com todas as funcionalidades solicitadas.