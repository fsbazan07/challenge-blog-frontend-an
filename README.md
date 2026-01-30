# Challenge Blog – Frontend Angular

Frontend del proyecto **Challenge Blog**, desarrollado con **Angular** y pensado para integrarse con un backend existente (NestJS) compartido con otra implementación en React.

El foco de este proyecto está en:

- Arquitectura clara
- Buen manejo de estado y errores
- Tests automatizados
- Dockerización simple y realista
- Separación frontend / backend

---

## 🧱 Stack tecnológico

- Angular (standalone APIs)
- TypeScript
- RxJS
- Angular Signals
- TailwindCSS
- Vitest (testing)
- Nginx (producción / docker)
- Docker & Docker Compose

---

## 📦 Requisitos

- Node.js >= 20
- pnpm
- Docker + Docker Compose
- Backend Challenge Blog corriendo (en local o docker)

> El backend se encuentra en un repositorio separado: https://github.com/fsbazan07/challenge-blog-backend

---

## 👤 Primer uso (crear usuario)

Este proyecto **no incluye seed ni usuario demo**.  
La primera vez que lo ejecutes, necesitás crear una cuenta desde la UI.

1. Levantá el backend (ver README del backend) y el frontend.
2. Abrí la app:
   - Local: `http://localhost:4200`
   - Docker: `http://localhost:8080`
3. Entrá a **Register**.
4. Completá `name`, `email` y `password` y enviá el formulario.
5. Luego iniciá sesión desde **Login** con las mismas credenciales.

✅ Al registrarte o loguearte, la sesión queda guardada automáticamente (tokens + usuario en storage).

> El usuario creado tiene permisos estándar para crear, editar y eliminar sus propios posts.

## 📁 Estructura del proyecto

```
src/
 ├─ app/
 │   ├─ features/
 │   │   ├─ auth/
 │   │   ├─ posts/
 │   │   └─ users/
 │   ├─ shared/
 │   │   ├─ http/
 │   │   ├─ directives/
 │   │   └─ utils/
 │   └─ app.component.ts
 ├─ assets/
 ├─ environments/
 │   └─ environment.ts
 ├─ index.html
 └─ main.ts
```

### Features

- **auth**: login, register, manejo de sesión
- **posts**: feed, crear post, mis posts
- **users**: perfil, cambio de contraseña, desactivación de cuenta

### Shared

- `http`: client HTTP y normalización de errores
- `directives`: input guards (keydown, paste, drop, beforeinput)
- `utils`: validadores, sanitizadores y expresiones regulares

---

## 🔐 Manejo de sesión y errores

- La sesión se maneja mediante `AuthSessionService`
- Tokens y usuario se persisten en storage
- Todas las respuestas de error se normalizan a un formato común (`ApiError`)
- El frontend está preparado para mostrar **toasts tanto en éxito como en error**

---

## 🧪 Testing

El proyecto cuenta con **tests unitarios** para:

### Servicios

- `AuthService`
- `AuthSessionService`
- `PostsService`
- `UsersService`

### Shared

- Validators
- Sanitizers
- Guards (`ngGuards`)
- Directiva `InputGuardDirective`

### Ejecutar tests

```bash
pnpm test
```

Salida esperada:

```txt
Tests passed ✓
```

---

## 🌍 Environments

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  assetsUrl: 'http://localhost:8080',
};
```

> En entorno dockerizado, el frontend **no se comunica directamente con el backend**, sino a través de **nginx como reverse proxy**.

---

## 🐳 Dockerización

### ¿Por qué Docker?

- Evita problemas de CORS
- Simula un entorno productivo real
- Permite compartir el backend con otros frontends (React / Angular)

### Servicios

- **frontend**: Angular build servido por nginx
- **backend**: vive en un repositorio separado y se comparte entre proyectos

---

## 🌐 nginx

Responsabilidades principales:

- Servir la SPA correctamente (`try_files /index.html`)
- Proxy de `/api` hacia el backend
- Proxy de assets
- Aumento de `client_max_body_size` para soportar uploads (`FormData`)

---

## 🧩 docker-compose

Levantado del frontend:

```bash
docker compose up --build
```

### Puertos

- Frontend: [http://localhost:8080](http://localhost:8080)
- Backend: [http://localhost:3000](http://localhost:3000) (levantado desde otro repositorio)

---

## 🔁 Relación con el backend

- El backend **NO vive en este repositorio**
- Se comparte con:
  - Frontend Angular
  - Frontend React

- El frontend consume siempre `/api` vía nginx

---

## 🚀 Flujo de desarrollo

Modo desarrollo:

```bash
pnpm install
pnpm start
```

Modo docker / demo:

```bash
docker compose up --build
```

---

## 🧠 Decisiones técnicas destacadas

- Uso de Standalone APIs de Angular
- Separación clara por feature
- Guards y sanitización centralizada
- Tests como parte del flujo normal
- Infraestructura simple pero realista (nginx + reverse proxy)

---

## ℹ️ Alcance

Este proyecto no incluye:

- Seed de usuarios
- Roles administrativos desde la UI
- Manejo de permisos avanzados en frontend

## ✨ Estado del proyecto

- ✅ Funcional
- ✅ Testeado
- ✅ Dockerizado
- ✅ Documentado

---

## 👩‍💻 Autora

**Florencia Samanta Bazan**
Frontend / Fullstack Developer
