# ---- Etapa 1: build de la app Angular ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---- Etapa 2: servir los estáticos con nginx ----
FROM nginx:1.27-alpine AS serve

COPY --from=build /app/dist/fronted/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
