# Control de stock — repuestos de carros

Sistema web sencillo para llevar el inventario de una venta de repuestos: productos
agrupados por categoria (rodamiento, bieleta, anillos...), con entradas cuando llega
mercancia, ventas que descuentan stock, y un historial de movimientos por producto.

**Stack**: Next.js (App Router) + TypeScript + Tailwind, Prisma como ORM, PostgreSQL.

## Desarrollo local

1. Tener Node.js y Docker instalados.
2. Levantar una base de datos Postgres local:
   ```bash
   docker run -d --name stock-pg -e POSTGRES_PASSWORD=stock -e POSTGRES_USER=stock \
     -e POSTGRES_DB=stock -p 5433:5432 postgres:16-alpine
   ```
   (si el contenedor ya existe, alcanza con `docker start stock-pg`)
3. Copiar `.env.example` a `.env` y ajustar `APP_PASSWORD` a la clave que quieras usar.
4. Instalar dependencias y preparar la base:
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma db seed
   ```
5. Levantar el servidor:
   ```bash
   npm run dev
   ```
   y entrar a [http://localhost:3000](http://localhost:3000).

## Estructura

- `prisma/schema.prisma` — modelo de datos: `Categoria`, `Producto`, `Movimiento`.
- `lib/actions/` — Server Actions: alta/edicion de productos y categorias, y el
  registro de movimientos de stock (entrada, venta, ajuste).
- `lib/consultas.ts` — lecturas de la base usadas por las paginas.
- `app/(app)/` — paginas protegidas por login: lista de productos, alta, edicion,
  detalle con historial.
- `app/login/` — pantalla de acceso con contrasena unica.
- `proxy.ts` — protege todas las rutas salvo `/login`.
- `app/api/exportar/route.ts` — descarga un CSV de respaldo (productos + movimientos).

## Regla importante del modelo de datos

El campo `cantidadStock` de un producto **nunca se edita directamente**. Todo cambio de
stock pasa por `registrarMovimiento` (`lib/actions/movimientos.ts`), que actualiza el
contador y crea el `Movimiento` correspondiente dentro de una misma transaccion. Asi el
stock y el historial nunca quedan desincronizados, y nunca puede quedar en negativo.

"Eliminar" un producto no lo borra de la base: le pone `activo = false` (baja logica),
para no perder su historial de movimientos.

## Despliegue en Vercel

1. Crear una base en [Neon](https://neon.tech) (plan gratuito).
2. Copiar la connection string **con pooler** (host que dice `-pooler`) como
   `DATABASE_URL`, y la conexion **directa** como `DIRECT_URL` (las migraciones no
   funcionan a traves del pooler).
3. En Vercel, importar el repo y cargar las variables de entorno: `DATABASE_URL`,
   `DIRECT_URL`, `APP_PASSWORD`, `SESSION_SECRET` (una cadena larga y aleatoria).
4. El script de build (`package.json`) ya corre `prisma migrate deploy` antes de
   compilar, asi que cada deploy aplica las migraciones pendientes solo.
5. Correr el seed una vez contra produccion: `DATABASE_URL=... DIRECT_URL=... npx prisma db seed`.
