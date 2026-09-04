# Plan de trabajo — Sistema de control de stock (repuestos de carros)

## Stack
- Next.js (React) — frontend + backend en un solo proyecto
- PostgreSQL (vía Neon o Supabase)
- Prisma como ORM
- Vercel para el hosting

## Fase 0 — Preparación (antes de tocar código)
- [ ] Crear cuenta en Neon o Supabase y sacar la connection string de PostgreSQL
- [ ] Crear repo en GitHub (vacío está bien, Claude Code lo puede inicializar)
- [ ] Tener Node.js instalado localmente
- [ ] Decidir el nombre del proyecto

## Fase 1 — Modelo de datos y setup base
- [ ] Inicializar proyecto Next.js
- [ ] Configurar Prisma y conectar la base de datos
- [ ] Definir schema: Categorías, Productos, Movimientos de stock
- [ ] Correr la primera migración
- [ ] Sembrar (seed) las categorías iniciales: rodamiento, bieleta, anillos, etc.

## Fase 2 — CRUD de productos
- [ ] Página que liste productos agrupados/filtrados por categoría
- [ ] Formulario para crear producto nuevo (nombre, categoría, cantidad inicial, precio, código)
- [ ] Editar/eliminar producto

## Fase 3 — Movimientos de stock
- [ ] Botón "agregar stock" (entrada de mercancía) → suma cantidad y registra el movimiento
- [ ] Botón "registrar venta" (salida) → resta cantidad y registra el movimiento
- [ ] Validación: no dejar que el stock quede negativo
- [ ] Vista de historial de movimientos por producto (opcional pero recomendado)

## Fase 4 — Detalles útiles
- [ ] Alerta visual cuando un producto tenga stock bajo (umbral configurable)
- [ ] Buscador simple por nombre o código
- [ ] Diseño responsive (probablemente lo vas a usar desde el celular en el negocio)

## Fase 5 — Despliegue
- [ ] Subir a GitHub
- [ ] Deploy en Vercel
- [ ] Conectar variables de entorno (connection string de la base de datos) en Vercel
- [ ] Probar en producción con datos reales

---

## Prompt para Claude Code (Fase 1 y 2 juntas, para arrancar)

```
Quiero construir un sistema web sencillo de control de stock para un negocio de venta de repuestos de carros. Ayúdame a armar la base del proyecto siguiendo esto:

STACK: Next.js (App Router), Prisma como ORM, PostgreSQL como base de datos, Tailwind para estilos.

MODELO DE DATOS:
- Categoria: id, nombre (ej: rodamiento, bieleta, anillos, filtros, pastillas de freno, etc.)
- Producto: id, nombre, categoriaId (relación con Categoria), marca/modelo de carro compatible (texto opcional), codigo/SKU (único), cantidadStock (entero), precio (decimal), stockMinimo (entero, para alertas de stock bajo)
- Movimiento: id, productoId (relación), tipo (ENTRADA o SALIDA), cantidad, fecha, nota (opcional)

TAREAS:
1. Inicializa el proyecto Next.js con Tailwind.
2. Configura Prisma con el schema de arriba, incluyendo las relaciones correctamente.
3. Crea un seed que agregue estas categorías iniciales: rodamiento, bieleta, anillos, filtros, pastillas de freno, correas, bujías.
4. Crea las rutas/API necesarias (o Server Actions) para: listar productos filtrados por categoría, crear producto, editar producto, eliminar producto.
5. Crea la interfaz: una página principal que muestre los productos agrupados por categoría en tarjetas o tabla, con un filtro/selector de categoría arriba, y un formulario (modal o página aparte) para agregar producto nuevo.
6. Deja el diseño simple, limpio y responsive — nada recargado, es para uso diario en un negocio pequeño.

No implementes todavía los movimientos de entrada/salida de stock (eso lo vemos después), solo el CRUD de productos y categorías por ahora. Explícame qué vas haciendo a medida que avanzas.
```

Cuando tengas esto funcionando, seguimos con el prompt para la Fase 3 (movimientos de entrada/salida de stock).
