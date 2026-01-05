# TaskManager - Professional Monorepo Starter

A high-performance, type-safe monorepo for task management with **Fastify API**, **React Web**, and **Expo Mobile** applications.

## 🎯 Features

- **🔐 Unified Authentication**: Google OAuth via Better-Auth for both web and mobile
- **📱 Cross-Platform**: Single codebase for business logic, platform-specific UI
- **🎨 Modern UI**: Shadcn UI for web, React Native Paper for mobile
- **⚡ Type-Safe**: End-to-end type safety with Zod and Prisma
- **🚀 High Performance**: Fastify backend with optimized query batching
- **📦 Monorepo**: pnpm workspaces for efficient dependency management

## 🏗️ Tech Stack

### Backend
- **Fastify** - High-performance web framework
- **Prisma 6.19.0** - Type-safe database ORM
- **Better-Auth** - Unified authentication
- **Zod** - Schema validation

### Web
- **React** - UI library
- **Vite** - Build tool
- **Shadcn UI** - Component library
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching

### Mobile
- **Expo 54** - React Native framework
- **React Native Paper** - Material Design components
- **Expo Router** - File-based routing
- **TanStack Query** - Data fetching

## 📁 Project Structure

```
taskmanager/
├── apps/
│   ├── api/          # Fastify backend
│   ├── web/          # React web app
│   └── mobile/       # Expo mobile app
├── packages/
│   ├── shared/       # Zod schemas & types
│   ├── database/     # Prisma client
│   └── auth/         # Better-Auth config
└── docs/             # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 10.15.1+
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Clone and install dependencies**
   ```bash
   cd taskmanager
   pnpm install
   ```

2. **Setup environment variables**
   ```bash
   # Copy environment templates
   cp packages/database/.env.example packages/database/.env
   cp apps/api/.env.example apps/api/.env
   
   # Edit .env files with your credentials
   # - DATABASE_URL: PostgreSQL connection string
   # - GOOGLE_CLIENT_ID: From Google Cloud Console
   # - GOOGLE_CLIENT_SECRET: From Google Cloud Console
   # - JWT_SECRET: Random secret key
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   ```

4. **Start development servers**
   ```bash
   # Start all apps
   pnpm dev
   
   # Or start individually
   pnpm dev:api      # API on port 3000
   pnpm dev:web      # Web on port 3001
   pnpm dev:mobile   # Mobile on port 8081
   ```

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - **Web**: `http://localhost:3000/api/auth/callback/google`
   - **Mobile**: `taskmanager://`

## 📝 Available Scripts

### Root Scripts
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages and apps
- `pnpm clean` - Remove all node_modules and build artifacts
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

### API Scripts
- `pnpm --filter api dev` - Start API in development mode
- `pnpm --filter api build` - Build API for production
- `pnpm --filter api start` - Start production server

## 🎨 UI Components

### Web (Shadcn UI)
- Button, Card, Checkbox, Input
- Form components with validation
- Responsive layouts
- Dark mode support

### Mobile (React Native Paper)
- Material Design 3
- List, Checkbox, TextInput, FAB
- Native animations
- Theme customization

## 🔒 Authentication Flow

### Web
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Google redirects back to `/api/auth/callback/google`
4. Better-Auth creates session (HTTP-only cookie)
5. User redirected to dashboard

### Mobile
1. User taps "Sign in with Google"
2. Opens browser for OAuth (expo-auth-session)
3. Google redirects to `taskmanager://`
4. Better-Auth creates session (SecureStore)
5. User navigated to main app

## 📊 Database Schema

### Models
- **User** - User accounts
- **Session** - Active sessions
- **Account** - OAuth provider accounts
- **Task** - User tasks
- **Verification** - Email verification tokens

## 🛣️ API Routes

### Authentication
- `POST /api/auth/sign-in/social` - Google sign-in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### Tasks
- `GET /v1/tasks` - List all tasks
- `GET /v1/tasks/:id` - Get single task
- `POST /v1/tasks` - Create task
- `PATCH /v1/tasks/:id` - Update task
- `PATCH /v1/tasks/:id/toggle` - Toggle completion
- `DELETE /v1/tasks/:id` - Delete task

## 🧪 Testing

```bash
# Run tests (when implemented)
pnpm test

# Type checking
pnpm -r exec tsc --noEmit
```

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build specific app
pnpm --filter api build
pnpm --filter web build
```

## 🚀 Deployment

### API (Fastify)
- Deploy to any Node.js hosting (Railway, Render, Fly.io)
- Set environment variables
- Run `pnpm --filter api start`

### Web (React)
- Deploy to Vercel, Netlify, or Cloudflare Pages
- Build command: `pnpm --filter web build`
- Output directory: `apps/web/dist`

### Mobile (Expo)
- Build with EAS: `eas build`
- Submit to stores: `eas submit`

## 📚 Documentation

- [Roadmap](docs/taskmanager-roadmap.md) - Detailed implementation guide
- [Progress](PROGRESS.md) - Current implementation status

## 🤝 Contributing

This is a starter template. Feel free to:
- Add new features
- Improve UI/UX
- Add tests
- Enhance documentation

## 📄 License

ISC

## 🙏 Acknowledgments

- **Fastify** - Fast and low overhead web framework
- **Prisma** - Next-generation ORM
- **Better-Auth** - Unified authentication
- **Expo** - Universal React applications
- **Shadcn UI** - Beautiful components
- **React Native Paper** - Material Design for React Native

---

**Built with ❤️ using the trinity: Fastify + Expo 54 + Prisma 6.19.0**
