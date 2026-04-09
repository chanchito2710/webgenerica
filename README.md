# WebGenerica - Plataforma E-commerce

Plataforma e-commerce genérica y reutilizable. Configurable para múltiples clientes sin modificar código.

## Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Base de datos**: PostgreSQL 16

## Requisitos

- Node.js 18+
- Docker y Docker Compose
- npm

## Inicio rápido

```bash
# 1. Levantar PostgreSQL y pgAdmin
docker-compose up -d

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run dev

# 3. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

## Accesos de desarrollo

| Servicio  | URL                    | Credenciales                          |
|-----------|------------------------|---------------------------------------|
| Frontend  | http://localhost:5173  | -                                     |
| Backend   | http://localhost:3001  | -                                     |
| pgAdmin   | http://localhost:5050  | admin@webgenerica.com / admin         |
| Admin     | http://localhost:5173  | admin@webgenerica.com / admin123      |

## Personalización por cliente

La tabla `SiteConfig` almacena nombre, logo, colores, contacto y redes sociales. Modificar esos valores adapta toda la tienda al nuevo cliente sin tocar código.
