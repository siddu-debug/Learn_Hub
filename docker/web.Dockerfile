FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json* yarn.lock* ./
COPY apps/web/package.json ./apps/web/
RUN yarn install

COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app/apps/web
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
