# Multi-stage build for production-optimized landing page
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
# Use npm install if package-lock.json is excluded, otherwise npm ci is faster
RUN npm install --prefer-offline --no-audit

# Copy source code
COPY . .

# Set build-time environment variables (use ARG with defaults)
ARG VITE_API_URL=https://grc-backend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io/api
ARG VITE_FRONTEND_URL=https://grc-frontend-prod.delightfulwave-81a84bdf.eastus.azurecontainerapps.io

# Set environment variables for build
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_FRONTEND_URL=${VITE_FRONTEND_URL}

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

# Add healthcheck (nginx:alpine has wget pre-installed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

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

