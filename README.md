# Vola - Flight Request System

Um sistema completo de gerenciamento de solicitações de voos construído com Next.js 16, React 19 e Supabase. Permite que funcionários solicitem viagens aéreas, gerentes aprovem ou rejeitem solicitações, e mantém todos atualizados através de notificações em tempo real.

## 🚀 Funcionalidades

### Para Funcionários
- **Solicitações de Voos**: Busque e solicite voos disponíveis
- **Dashboard Pessoal**: Acompanhe o status de suas solicitações (pendente, aprovado, rejeitado)
- **Notificações**: Receba atualizações sobre suas solicitações
- **Perfil de Usuário**: Gerencie suas informações pessoais

### Para Aprovadores
- **Revisão de Solicitações**: Visualize e avalie solicitações pendentes
- **Aprovação/Rejeição**: Aprove ou rejeite solicitações com comentários
- **Histórico**: Acompanhe todas as solicitações processadas

### Sistema Geral
- **Autenticação Segura**: Login e cadastro com Supabase Auth
- **Interface Responsiva**: Design moderno com Tailwind CSS e Radix UI
- **Notificações em Tempo Real**: Atualizações instantâneas sobre mudanças
- **Banco de Dados Relacional**: Estrutura robusta com PostgreSQL

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI/UX**: Tailwind CSS, Radix UI, Lucide Icons
- **Ferramentas de Desenvolvimento**: ESLint, PostCSS
- **Linguagem**: TypeScript

## 📋 Pré-requisitos

- Node.js 18+
- npm, yarn, pnpm ou bun
- Conta no Supabase

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd vola
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

### 3. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL na ordem:
   - `src/scripts/001_create_tables.sql` - Cria as tabelas e políticas RLS
   - `src/scripts/002_seed_data.sql` - Insere dados de exemplo

3. Copie as variáveis de ambiente do Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (para server-side operations)

4. Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Execute o projeto
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
vola/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Estilos globais
│   │   ├── layout.tsx          # Layout principal
│   │   ├── page.tsx            # Página inicial
│   │   ├── auth/               # Páginas de autenticação
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── signup-success/
│   │   ├── dashboard/          # Dashboard do usuário
│   │   ├── flights/            # Busca de voos
│   │   │   └── search/
│   │   ├── approvals/          # Aprovações (para managers)
│   │   ├── notifications/      # Notificações
│   │   └── requests/           # Solicitações do usuário
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes UI (shadcn/ui)
│   │   ├── approval-actions.tsx
│   │   ├── flight-search-form.tsx
│   │   ├── notification-item.tsx
│   │   ├── notifications-bell.tsx
│   │   ├── request-actions.tsx
│   │   └── user-nav.tsx
│   ├── lib/                    # Utilitários
│   │   ├── utils.ts
│   │   └── supabase/           # Configurações Supabase
│   │       ├── client.ts
│   │       ├── middleware.ts
│   │       └── server.ts
│   └── scripts/                # Scripts SQL
│       ├── 001_create_tables.sql
│       └── 002_seed_data.sql
├── public/                     # Arquivos estáticos
├── components.json             # Configuração shadcn/ui
├── eslint.config.mjs           # Configuração ESLint
├── next.config.ts              # Configuração Next.js
├── package.json                # Dependências
├── postcss.config.mjs          # Configuração PostCSS
├── tailwind.config.ts          # Configuração Tailwind
└── tsconfig.json               # Configuração TypeScript
```

## 🗄️ Banco de Dados

### Tabelas Principais

- **profiles**: Perfis de usuários (extende auth.users)
  - Roles: employee, approver, admin
- **flights**: Dados de voos disponíveis
- **flight_requests**: Solicitações de voos
- **notifications**: Notificações do sistema

### Políticas RLS (Row Level Security)

O sistema utiliza políticas RLS do Supabase para controle de acesso:
- Usuários só veem seus próprios dados
- Aprovadores podem ver solicitações pendentes
- Dados públicos são acessíveis conforme necessário

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run start    # Inicia servidor de produção
npm run lint     # Executa linting
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Self-hosted

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento


