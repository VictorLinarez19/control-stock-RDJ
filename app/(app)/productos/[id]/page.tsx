import Link from "next/link";
import { notFound } from "next/navigation";
import { AccionesStock } from "@/components/AccionesStock";
import { listarMovimientos, obtenerProducto } from "@/lib/consultas";
import { formatearDinero, formatearFecha } from "@/lib/format";

const ETIQUETA_TIPO: Record<string, { texto: string; clase: string }> = {
  ENTRADA: { texto: "Entrada", clase: "bg-emerald-50 text-emerald-700" },
  SALIDA: { texto: "Venta", clase: "bg-slate-100 text-slate-700" },
  AJUSTE: { texto: "Ajuste", clase: "bg-amber-50 text-amber-700" },
};

export default async function PaginaProducto({ params }: PageProps<"/productos/[id]">) {
  const { id } = await params;
  const productoId = Number(id);
  if (!Number.isInteger(productoId)) notFound();

  const producto = await obtenerProducto(productoId);
  if (!producto) notFound();

  const movimientos = await listarMovimientos(productoId);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-slate-900">{producto.nombre}</h1>
          <p className="text-sm text-slate-500">
            <span className="font-mono">{producto.codigo}</span> · {producto.categoriaNombre}
            {producto.compatibilidad ? ` · ${producto.compatibilidad}` : ""}
          </p>
        </div>
        <Link
          href={`/productos/${producto.id}/editar`}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Editar
        </Link>
      </div>

      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">En stock</p>
            <p
              className={`text-3xl font-semibold tabular-nums ${
                producto.stockBajo ? "text-amber-600" : "text-slate-900"
              }`}
            >
              {producto.cantidadStock}
            </p>
            {producto.stockBajo ? (
              <p className="text-xs text-amber-600">stock minimo: {producto.stockMinimo}</p>
            ) : null}
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Precio de venta</p>
            <p className="text-lg font-medium text-slate-900">
              {formatearDinero(producto.precioVenta)}
            </p>
            {producto.costo !== null ? (
              <p className="text-xs text-slate-400">costo {formatearDinero(producto.costo)}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          <AccionesStock producto={producto} />
        </div>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Historial de movimientos
        </h2>
        {movimientos.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
            Todavia no hay movimientos registrados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl bg-white ring-1 ring-slate-200">
            {movimientos.map((m) => {
              const etiqueta = ETIQUETA_TIPO[m.tipo] ?? { texto: m.tipo, clase: "bg-slate-100" };
              return (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${etiqueta.clase}`}
                  >
                    {etiqueta.texto}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900">
                      {m.tipo === "AJUSTE" ? `Stock corregido a ${m.cantidad}` : `${m.cantidad} unidades`}
                      {m.precioUnitario !== null ? ` · ${formatearDinero(m.precioUnitario)} c/u` : ""}
                    </p>
                    {m.nota ? <p className="truncate text-xs text-slate-500">{m.nota}</p> : null}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatearFecha(m.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
