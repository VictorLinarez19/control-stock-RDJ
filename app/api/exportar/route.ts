import { prisma } from "@/lib/prisma";

/// Respaldo simple: descarga productos y movimientos en dos hojas CSV dentro
/// de un mismo archivo. El plan gratuito de Neon no garantiza backups y son
/// datos reales del negocio, asi que conviene poder sacar una copia cuando
/// se quiera sin depender de nada mas.
export async function GET() {
  const [productos, movimientos] = await Promise.all([
    prisma.producto.findMany({
      include: { categoria: true },
      orderBy: [{ categoria: { nombre: "asc" } }, { nombre: "asc" }],
    }),
    prisma.movimiento.findMany({
      include: { producto: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const filasProductos = [
    ["codigo", "nombre", "categoria", "compatibilidad", "stock", "stock_minimo", "costo", "precio_venta", "activo"],
    ...productos.map((p) => [
      p.codigo,
      p.nombre,
      p.categoria.nombre,
      p.compatibilidad ?? "",
      String(p.cantidadStock),
      String(p.stockMinimo),
      p.costo?.toString() ?? "",
      p.precioVenta.toString(),
      p.activo ? "si" : "no",
    ]),
  ];

  const filasMovimientos = [
    ["fecha", "producto", "codigo", "tipo", "cantidad", "precio_unitario", "nota"],
    ...movimientos.map((m) => [
      m.createdAt.toISOString(),
      m.producto.nombre,
      m.producto.codigo,
      m.tipo,
      String(m.cantidad),
      m.precioUnitario?.toString() ?? "",
      m.nota ?? "",
    ]),
  ];

  const csv = [
    "PRODUCTOS",
    aCsv(filasProductos),
    "",
    "MOVIMIENTOS",
    aCsv(filasMovimientos),
  ].join("\n");

  const fecha = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stock-${fecha}.csv"`,
    },
  });
}

function aCsv(filas: string[][]): string {
  return filas.map((fila) => fila.map(escaparCelda).join(",")).join("\n");
}

function escaparCelda(valor: string): string {
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}
