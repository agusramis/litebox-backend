FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./
RUN npm ci
COPY apps ./apps
RUN npx prisma generate --schema=./apps/api/src/prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/api/src/prisma ./apps/api/src/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
RUN chown -R nestjs:nodejs /app
USER nestjs
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {process.exit(r.statusCode === 404 ? 0 : 1)})"
CMD ["npm", "run", "start:migrate"]