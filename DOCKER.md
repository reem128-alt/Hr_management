# HR Management System - Docker Setup

This project includes Docker configuration for easy deployment and development.

## Quick Start

### Production
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Development
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## Services

### Production (`docker-compose.yml`)
- **app**: NestJS application on port 3000
- **postgres**: PostgreSQL database on port 5432
- **pgadmin**: Database admin interface on port 5050 (optional, use `--profile admin`)

### Development (`docker-compose.dev.yml`)
- **app**: NestJS application with hot reload on ports 3000 & 9229 (debug)
- **postgres**: PostgreSQL database on port 5432

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hr_management

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Database Migrations

The Dockerfile automatically generates the Prisma client. For migrations:

```bash
# Production
docker-compose exec app npx prisma migrate deploy

# Development
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev
```

## Access Points

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/docs
- **Database**: localhost:5432
- **PgAdmin**: http://localhost:5050 (if enabled)

## Build Commands

```bash
# Build production image
docker build -t hr-management .

# Build development image
docker build -f Dockerfile.dev -t hr-management:dev .
```
