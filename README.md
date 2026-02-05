# Pattern Blindness Frontend

[![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/PatternBlindness/ci.yml?branch=main)](https://github.com/yourusername/PatternBlindness/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)

The frontend for Pattern Blindness - a deliberate practice platform for interview preparation.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Technology Stack

| Component     | Technology   | Version |
| ------------- | ------------ | ------- |
| Framework     | Next.js      | 16+     |
| Library       | React        | 19+     |
| Language      | TypeScript   | 5+      |
| Styling       | Tailwind CSS | 4+      |
| UI Components | Radix UI     | Latest  |
| Node          | Node.js      | 20+     |

## Getting Started

### Prerequisites

- Node.js 20+ and npm/yarn/pnpm
- Backend API running (local or Render)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/PatternBlindness.git
cd PatternBlindness/pattern-blindness-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL
# Development: Use local backend
NEXT_PUBLIC_API_URL=http://localhost:8080

# Production: Use Render backend
# NEXT_PUBLIC_API_URL=https://pattern-blindness-backend.onrender.com
```

| Variable              | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:8080` |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are publicly exposed to the browser.

## Development

### Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Format code (if configured)
npm run format
```

### Project Structure

```
src/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Home page
│   ├── layout.tsx           # Root layout
│   ├── login/               # Login page
│   ├── register/            # Register page
│   ├── dashboard/           # User dashboard
│   ├── practice/            # Practice session pages
│   ├── patterns/            # Patterns browse
│   ├── history/             # Attempt history
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   ├── features/            # Feature-specific components
│   ├── shared/              # Shared UI components
│   └── ui/                  # Radix UI wrappers
├── lib/                     # Utilities and helpers
│   ├── api/                 # API client functions
│   ├── auth/                # Authentication utilities
│   ├── hooks/               # Custom React hooks
│   ├── constants.ts         # App-wide constants
│   └── utils.ts             # Helper functions
└── types/                   # TypeScript type definitions
    ├── api.ts              # API response types
    └── index.ts            # Common types
```

### API Integration

The frontend uses a typed API client for communicating with the backend:

```typescript
import { api } from '@/lib/api/client';

// GET request
const patterns = await api.get<Pattern[]>('/api/patterns');

// POST request
const attempt = await api.post<Attempt>('/api/attempts/start', { problemId });

// Error handling
try {
  const result = await api.get('/api/data');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
  }
}
```

### Authentication

Auth tokens are stored in localStorage and automatically included in API requests via the `Authorization` header.

```typescript
// Token is automatically retrieved and sent with requests
const header = { Authorization: `Bearer ${token}` };
```

## Deployment

### Render (Recommended for Monorepo)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure as follows:
   - **Repository:** Your GitHub repo
   - **Branch:** main
   - **Root Directory:** `pattern-blindness-frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     NEXT_PUBLIC_API_URL=https://pattern-blindness-backend.onrender.com
     ```

4. Click "Deploy"

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel dashboard at https://vercel.com/new

**Configure:**
- **Root Directory:** `pattern-blindness-frontend`
- **Environment:** 
  ```
  NEXT_PUBLIC_API_URL=https://pattern-blindness-backend.onrender.com
  ```

### Docker

```bash
# Build Docker image
docker build -t pattern-blindness-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://pattern-blindness-backend.onrender.com \
  pattern-blindness-frontend
```

**Dockerfile example:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
```

## Standards & Best Practices

### File Naming
- Components: PascalCase (e.g., `UserCard.tsx`)
- Utilities/Hooks: camelCase (e.g., `useAuth.ts`)

### Code Style
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- ESLint configuration enforces consistency
- Run `npm run lint` before committing

### TypeScript
- Strict mode enabled in `tsconfig.json`
- All API responses are typed
- Props are fully typed

### Responsive Design
- Mobile-first approach using Tailwind CSS
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- All pages must be tested on mobile, tablet, and desktop

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Commit changes: `git commit -am 'Add feature'`
5. Push to branch: `git push origin feature/your-feature`
6. Submit a Pull Request

### Pull Request Checklist

- [ ] Code builds without errors: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Changes are responsive and work on mobile
- [ ] New features have corresponding types
- [ ] Environment variables are documented

## Troubleshooting

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process (macOS)
kill -9 <PID>

# Or run on different port
npm run dev -- -p 3001
```

### API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`
- Check backend is running: `curl http://localhost:8080/health`
- Check browser console for CORS errors
- Verify backend CORS settings include your frontend URL

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs/primitives/overview/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Questions?** Open an issue on [GitHub](https://github.com/yourusername/PatternBlindness/issues)
