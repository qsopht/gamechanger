# GameChanger Development Guidelines

## Project Overview

GameChanger is a Railway-compatible subscription management platform built with Node.js, TypeScript, React, and PostgreSQL.

## Technology Stack

- **Backend**: Express.js, TypeScript, PostgreSQL, Stripe
- **Frontend**: React 18, Vite, TypeScript, Ant Design, Zustand
- **Deployment**: Railway, Docker
- **Database**: PostgreSQL with migrations

## Development Workflow

### Getting Started

1. Install dependencies: `npm install`
2. Copy environment files: `cp backend/.env.example backend/.env` and `cp frontend/.env.example frontend/.env`
3. Start services: `npm run dev` or use Docker Compose: `docker-compose up`
4. Access: Frontend at http://localhost:5173, Backend at http://localhost:3000

### Code Structure

```
backend/
├── src/
│   ├── controllers/    - Request handlers
│   ├── models/         - Database models
│   ├── routes/         - API endpoints
│   ├── services/       - Business logic
│   ├── middleware/     - Express middleware
│   └── migrations/     - DB schema
frontend/
├── src/
│   ├── components/     - Reusable React components
│   ├── pages/          - Page components
│   ├── services/       - API clients
│   └── store/          - Zustand stores
```

## Key Features Implemented

- ✅ User authentication with JWT
- ✅ Subscription plan management
- ✅ User subscription lifecycle
- ✅ Invoice tracking
- ✅ Stripe integration ready
- ✅ React frontend with Ant Design UI
- ✅ Railway-ready deployment config
- ✅ Docker support for local dev
- ✅ TypeScript throughout

## Database Schema

- **users**: User accounts
- **subscription_plans**: Available plans
- **subscriptions**: User plan subscriptions
- **invoices**: Payment records
- **payment_methods**: Stored payment methods

Run migrations: `npm run migrate`

## API Conventions

- Base paths: `/auth`, `/plans`, `/subscriptions`
- All protected endpoints require Bearer token
- Responses in JSON format
- Error responses include error message

## Frontend Conventions

- Components in `/components` for reusable UI
- Pages in `/pages` for route pages
- State management with Zustand stores
- API calls through services in `/services`
- Ant Design for UI components

## Deployment

### Local Development
```bash
docker-compose up  # Starts PostgreSQL, backend, frontend
npm run dev        # Alternative: runs both servers
```

### Production (Railway)
1. Push to GitHub
2. Connect repository to Railway
3. Add PostgreSQL database
4. Configure environment variables
5. Railway automatically builds and deploys

See RAILWAY_DEPLOYMENT.md for detailed instructions.

## Common Tasks

### Add a new API endpoint

1. Create model in `backend/src/models/`
2. Create controller in `backend/src/controllers/`
3. Add routes in `backend/src/routes/`
4. Add to main `src/index.ts`

### Add a new frontend page

1. Create component in `frontend/src/pages/`
2. Add route to `frontend/src/App.tsx`
3. Create service in `frontend/src/services/` if needed
4. Use Zustand store for state if needed

### Add database migration

1. Update migration schema in `backend/src/migrations/schema.ts`
2. Run: `npm run migrate`

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/gamechanger
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_xxx
PORT=3000
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

## Next Steps for Enhancement

1. Add email notifications
2. Implement webhook handlers for Stripe events
3. Add payment card management UI
4. Create admin dashboard
5. Implement subscription renewal logic
6. Add testing (Jest, Vitest)
7. Set up monitoring and logging
8. Add input validation schemas
9. Implement rate limiting
10. Add more detailed error handling

## Useful Commands

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend     # Start backend only
npm run dev:frontend    # Start frontend only

# Building
npm run build           # Build both
npm run build:backend   # Build backend
npm run build:frontend  # Build frontend

# Database
npm run migrate         # Run migrations

# Production
npm start               # Start production server

# Docker
docker-compose up       # Start with Docker
docker-compose down     # Stop containers
```

## Git Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -am "description"`
3. Push branch: `git push origin feature/feature-name`
4. Create Pull Request on GitHub

## Code Style

- Use TypeScript for type safety
- Use async/await for asynchronous code
- Follow naming conventions: camelCase for variables/functions
- Add JSDoc comments for complex functions
- Keep functions small and focused
- Use Zustand for state management

## Testing

To add tests later:

```bash
# Backend tests with Jest
npm install --save-dev jest @types/jest ts-jest

# Frontend tests with Vitest
npm install --save-dev vitest @testing-library/react
```

## Performance Optimization

- Use connection pooling (already configured in db.ts)
- Implement query caching if needed
- Optimize database indexes
- Lazy load frontend components
- Use code splitting in Vite

## Security Best Practices

- Never commit .env files
- Use strong JWT secrets
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated
- Implement rate limiting
- Use parameterized queries (already done)

## Troubleshooting

### Database connection fails
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials

### Frontend can't connect to backend
- Check CORS configuration in backend
- Verify API base URL in frontend .env
- Ensure backend is running

### Migrations fail
- Check database permissions
- Review migration SQL syntax
- Check for existing tables

## Resources

- [Express.js Docs](https://expressjs.com)
- [React Docs](https://react.dev)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Stripe Docs](https://stripe.com/docs)
- [Railway Docs](https://docs.railway.app)
- [TypeScript Docs](https://www.typescriptlang.org)
