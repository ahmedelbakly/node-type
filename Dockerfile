# Stage 1: Builder (with dev dependencies)
FROM node:18-alpine AS builder

# Install system dependencies and updates
RUN apk update && apk upgrade && \
    apk add --no-cache git && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Install security updates and tini init system
RUN apk update && \
    apk upgrade && \
    apk add --no-cache tini && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Clean up production dependencies
RUN npm prune --production && \
    npm cache clean --force

# Switch to non-root user
USER appuser

# Use tini as init process
ENTRYPOINT ["/sbin/tini", "--"]

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]