# Use Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Copy all files
COPY . .

# Expose port 80
EXPOSE 80

# Start the server
CMD ["node", "server.js"]
