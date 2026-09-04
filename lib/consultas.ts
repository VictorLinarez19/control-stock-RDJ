import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/// Vista de producto lista para la UI: los `Decimal` de Prisma ya vienen
/// convertidos a `number`, porque un `Decimal` no cruza limpio la frontera
/// entre un Server Component y un Client Component.
export type ProductoVista = {
  id: number;
  nombre: string;
  codigo: string;
  compatibilidad: string | null;
  cantidadStock: number;
  costo: number | null;
  precioVenta: number;
  stockMinimo: number;
  categoriaId: number;
  categoriaNombre: string;
  stockBajo: boolean;
};

type FiltrosProductos = {
  categoriaId?: number;
  busqueda?: string;
};

function condiciones({ categoriaId, busqueda }: FiltrosProductos): Prisma.ProductoWhereInput {
  const where: Prisma.ProductoWhereInput = { activo: true };

  if (categoriaId) {
    where.categoriaId = categoriaId;
  }

  const termino = busqueda?.trim();
  if (termino) {
    where.OR = [
      { nombre: { contains: termino, mode: "insensitive" } },
      { codigo: { contains: termino, mode: "insensitive" } },
      { compatibilidad: { contains: termino, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductoVista[]> {
  const productos = await prisma.producto.findMany({
    where: condiciones(filtros),
    include: { categoria: true },
    orderBy: [{ categoria: { nombre: "asc" } }, { nombre: "asc" }],
  });

  return productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    codigo: p.codigo,
    compatibilidad: p.compatibilidad,
    cantidadStock: p.cantidadStock,
    costo: p.costo ? Number(p.costo) : null,
    precioVenta: Number(p.precioVenta),
    stockMinimo: p.stockMinimo,
    categoriaId: p.categoriaId,
    categoriaNombre: p.categoria.nombre,
    stockBajo: p.cantidadStock <= p.stockMinimo,
  }));
}

export async function obtenerProducto(id: number): Promise<ProductoVista | null> {
  const p = await prisma.producto.findUnique({
    where: { id },
    include: { categoria: true },
  });
  if (!p) return null;

  return {
    id: p.id,
    nombre: p.nombre,
    codigo: p.codigo,
    compatibilidad: p.compatibilidad,
    cantidadStock: p.cantidadStock,
    costo: p.costo ? Number(p.costo) : null,
    precioVenta: Number(p.precioVenta),
    stockMinimo: p.stockMinimo,
    categoriaId: p.categoriaId,
    categoriaNombre: p.categoria.nombre,
    stockBajo: p.cantidadStock <= p.stockMinimo,
  };
}

export async function listarCategorias() {
  return prisma.categoria.findMany({ orderBy: { nombre: "asc" } });
}

/// Cuantos productos activos estan en o por debajo de su stock minimo.
/// Se resuelve con SQL crudo porque Prisma no compara dos columnas entre si.
export async function contarStockBajo(): Promise<number> {
  const filas = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(*)::bigint AS total
    FROM "Producto"
    WHERE "activo" = true AND "cantidadStock" <= "stockMinimo"
  `;
  return Number(filas[0]?.total ?? 0);
}

export async function listarMovimientos(productoId: number) {
  const movimientos = await prisma.movimiento.findMany({
    where: { productoId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return movimientos.map((m) => ({
    id: m.id,
    tipo: m.tipo,
    cantidad: m.cantidad,
    precioUnitario: m.precioUnitario ? Number(m.precioUnitario) : null,
    nota: m.nota,
    createdAt: m.createdAt,
  }));
}
