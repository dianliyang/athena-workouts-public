FROM node:22-alpine AS build

WORKDIR /app

RUN apk add --no-cache git

COPY package.json package-lock.json ./
RUN npm ci

COPY docs ./docs
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html

EXPOSE 80
