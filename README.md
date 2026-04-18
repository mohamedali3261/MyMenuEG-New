# MyMenuEG - E-Commerce Platform

A full-stack e-commerce platform built with Node.js, Express, React, and MySQL.

## Features

- Product management with categories and variants
- Order management with status tracking
- Coupon system with date validation
- Admin dashboard with analytics
- Real-time notifications via WebSocket
- Email notifications for orders
- Payment integration (Paymob)
- Product reviews and ratings
- Contact form management
- Image upload and optimization
- Database backup/restore
- Redis caching (optional)

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- MySQL
- JWT Authentication
- WebSocket (ws)
- Nodemailer
- Sharp (Image processing)

### Frontend
- React 19
- Vite
- TailwindCSS
- Zustand (State management)
- React Router
- Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mymenueg
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp backend/server/.env.example backend/server/.env
# Edit .env with your configuration
```

4. Setup database
```bash
npx prisma generate --schema=backend/server/prisma/schema.prisma
npx prisma db push --schema=backend/server/prisma/schema.prisma
```

5. Start development servers
```bash
npm run dev:all
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run server` | Start backend server |
| `npm run dev:all` | Start all services |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

## API Documentation

Access the API documentation at: `http://localhost:5000/api/docs`

### Main Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/login` | Admin login |
| `GET /api/v1/products` | List products |
| `POST /api/v1/orders` | Create order |
| `POST /api/v1/contact` | Submit contact form |
| `POST /api/v1/reviews` | Submit product review |
| `POST /api/v1/payment/create` | Initialize payment |
| `GET /api/v1/payment/callback` | Payment callback |

## Project Structure

```
mymenueg/
├── backend/
│   └── server/
│       ├── prisma/          # Database schema
│       ├── src/
│       │   ├── controllers/ # Route handlers
│       │   ├── middleware/  # Express middleware
│       │   ├── routes/      # API routes
│       │   ├── services/    # Business logic
│       │   └── utils/       # Helper functions
│       └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Zustand store
│   │   └── utils/           # Helper functions
│   └── public/              # Static files
└── package.json
```

## Security Features

- JWT Authentication with refresh tokens
- Rate Limiting on all endpoints
- Helmet.js Security Headers
- Content Security Policy
- Input Validation with Zod
- SQL Injection Protection (Prisma)
- File Upload Security
- CSRF Protection

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `CLOUDINARY_*` | Cloudinary credentials |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection for caching |
| `SMTP_*` | Email configuration |
| `PAYMOB_*` | Payment gateway credentials |

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## WebSocket Events

The server broadcasts real-time events via WebSocket at `/ws`:

| Event | Description |
|-------|-------------|
| `new_order` | New order received |
| `order_update` | Order status changed |
| `notification` | New notification |

## License

MIT
