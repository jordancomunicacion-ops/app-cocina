FROM node:20-bullseye-slim

WORKDIR /app

# Install dependencies sans lockfile (Monorepo decoupling)
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Generate Client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build
RUN npm run build

EXPOSE 3000

# Start Production
CMD ["node", "dist/main"]
