FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json* yarn.lock* ./
COPY apps/api/package.json ./apps/api/
RUN yarn install

COPY apps/api ./apps/api
COPY apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api
RUN npx prisma generate
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./

RUN mkdir -p logs

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
