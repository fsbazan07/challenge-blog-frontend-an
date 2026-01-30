# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

# pnpm
RUN corepack enable

# deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# code
COPY . .

# build angular (output en dist/)
RUN pnpm build

# ---------- run ----------
FROM nginx:1.27-alpine AS runtime

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build de Angular a nginx
# Nota: en Angular 17/18 normalmente queda en dist/<project-name>/browser
COPY --from=build /app/dist/challenge-blog-frontend-an/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
