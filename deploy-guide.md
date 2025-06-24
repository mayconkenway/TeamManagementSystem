# Guia de Deploy no Vercel

## Método 1: Deploy via Dashboard do Vercel (Recomendado)

### Passo 1: Preparar os arquivos
Certifique-se de que você tem estes arquivos na pasta do projeto:
- `api/index.js`
- `vercel.json`
- `package.json`
- `README.md`

### Passo 2: Criar repositório no GitHub
1. Vá para [GitHub](https://github.com) e crie um novo repositório
2. Faça upload dos arquivos ou use Git:
   ```bash
   git init
   git add .
   git commit -m "Sistema de gerenciamento de equipe"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/sistema-equipe.git
   git push -u origin main
   ```

### Passo 3: Deploy no Vercel
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte sua conta do GitHub
4. Selecione o repositório do sistema
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (deixe vazio)
   - **Build Command**: `npm run build`
   - **Output Directory**: deixe vazio
   - **Install Command**: `npm install`

### Passo 4: Deploy
1. Clique em "Deploy"
2. Aguarde o build finalizar
3. Acesse a URL fornecida pelo Vercel

---

## Método 2: Deploy via Vercel CLI

### Passo 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Passo 2: Login no Vercel
```bash
vercel login
```

### Passo 3: Deploy
Na pasta do projeto, execute:
```bash
vercel
```

Siga as instruções:
- Set up and deploy? `Y`
- Which scope? Selecione sua conta
- Link to existing project? `N`
- What's your project's name? `sistema-gerenciamento-equipe`
- In which directory is your code located? `./`

### Passo 4: Deploy para produção
```bash
vercel --prod
```

---

## Configurações Importantes

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### package.json
```json
{
  "name": "sistema-gerenciamento-equipe",
  "version": "1.0.0",
  "main": "api/index.js",
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Testando o Deploy

Após o deploy, teste:
1. Acesse a URL fornecida pelo Vercel
2. Teste o login com: admin / admin123
3. Verifique as APIs:
   - `GET /api/status`
   - `POST /api/auth/login`

---

## Solução de Problemas

### Erro de Build
- Verifique se o `package.json` está correto
- Certifique-se de que não há erros de sintaxe no código

### Erro 404
- Verifique se o `vercel.json` está configurado corretamente
- Confirme se o arquivo `api/index.js` existe

### Erro de Função
- Verifique se as rotas estão definidas corretamente
- Confirme se não há imports/requires de módulos inexistentes

---

## Próximos Passos

Após o deploy bem-sucedido:
1. Configure um domínio customizado (opcional)
2. Configure variáveis de ambiente se necessário
3. Configure analytics e monitoramento
4. Configure CI/CD para deploys automáticos

O sistema estará disponível 24/7 no Vercel com todas as funcionalidades implementadas.