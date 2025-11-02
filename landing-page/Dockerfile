# Multi-stage build for production-optimized landing page
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy public assets
COPY --from=builder /app/public /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Labels for Azure and management
LABEL maintainer="DoganConsult <info@doganconsult.com>"
LABEL version="1.0.0"
LABEL description="Shahin GRC Landing Page - شاهين للحوكمة"
LABEL org.opencontainers.image.title="Shahin GRC Landing Page"
LABEL org.opencontainers.image.description="الحوكمة الاستثنائية، من المملكة إلى العالم"
LABEL org.opencontainers.image.vendor="DoganConsult"
LABEL org.opencontainers.image.url="https://doganconsult.com"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

