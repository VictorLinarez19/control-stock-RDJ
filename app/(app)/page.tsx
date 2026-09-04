import Link from "next/link";
import { Suspense } from "react";
import { AccionesStock } from "@/components/AccionesStock";
import { FiltrosProductos } from "@/components/FiltrosProductos";
import {
  contarStockBajo,
  listarCategorias,
  listarProductos,
  type ProductoVista,
} from "@/lib/consultas";
import { formatearDinero } from "@/lib/format";

export default async function PaginaInicio({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const busqueda = typeof params.q === "string" ? params.q : undefined;
  const categoriaId = Number(params.categoria) || undefined;

  const [categorias, productos, stockBajo] = await Promise.all([
    listarCategorias(),
    listarProductos({ busqueda, categoriaId }),
    contarStockBajo(),
  ]);

  const grupos = agruparPorCategoria(productos);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Productos</h1>
        <Link
          href="/productos/nuevo"
          className="ml-auto rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Nuevo producto
        </Link>
      </div>

      {stockBajo > 0 ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          {stockBajo === 1
            ? "1 producto esta en stock bajo."
            : `${stockBajo} productos estan en stock bajo.`}
        </p>
      ) : null}

      {/* useSearchParams necesita un limite de Suspense en el arbol del servidor. */}
      <Suspense fallback={<div className="h-12" />}>
        <FiltrosProductos categorias={categorias} />
      </Suspense>

      {productos.length === 0 ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">
          No hay productos que coincidan. Proba con otra busqueda o{" "}
          <Link href="/productos/nuevo" className="font-medium text-slate-900 underline">
            agrega uno nuevo
          </Link>
          .
        </p>
      ) : (
        grupos.map(([categoria, items]) => (
          <section key={categoria}>
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
              {categoria} <span className="font-normal">({items.length})</span>
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((producto) => (
                <li key={producto.id}>
                  <TarjetaProducto producto={producto} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function TarjetaProducto({ producto }: { producto: ProductoVista }) {
  return (
    <article className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Link
            href={`/productos/${producto.id}`}
            className="font-medium text-slate-900 hover:underline"
          >
            {producto.nombre}
          </Link>
          <p className="mt-0.5 text-sm text-slate-500">
            <span className="font-mono">{producto.codigo}</span>
            {producto.compatibilidad ? ` · ${producto.compatibilidad}` : ""}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Venta {formatearDinero(producto.precioVenta)}
            {producto.costo !== null ? (
              <span className="text-slate-400"> · costo {formatearDinero(producto.costo)}</span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
          <span
            className={`text-2xl font-semibold tabular-nums ${
              producto.stockBajo ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {producto.cantidadStock}
          </span>
          <span className="text-xs text-slate-500">
            {producto.stockBajo ? `stock bajo (min. ${producto.stockMinimo})` : "en stock"}
          </span>
        </div>

        <div className="sm:w-72">
          <AccionesStock producto={producto} />
        </div>
      </div>
    </article>
  );
}

function agruparPorCategoria(productos: ProductoVista[]): Array<[string, ProductoVista[]]> {
  const grupos = new Map<string, ProductoVista[]>();
  for (const producto of productos) {
    const existente = grupos.get(producto.categoriaNombre);
    if (existente) existente.push(producto);
    else grupos.set(producto.categoriaNombre, [producto]);
  }
  return [...grupos.entries()];
}
