# Simple Dockerfile using local node_modules
FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma runtime
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package.json package-lock.json* ./

# Copy local node_modules to avoid network downloads
COPY node_modules ./node_modules

# Copy locally built dist folder
COPY dist ./dist

# Copy source code
COPY . .

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set correct permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
