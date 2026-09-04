import { notFound } from "next/navigation";
import { FormularioProducto } from "@/components/FormularioProducto";
import { NuevaCategoria } from "@/components/NuevaCategoria";
import { actualizarProducto, desactivarProducto } from "@/lib/actions/productos";
import { listarCategorias, obtenerProducto } from "@/lib/consultas";

// Misma razon que en productos/nuevo: evita que la lista de categorias (y el
// producto mismo) queden congelados desde el momento del deploy.
export const dynamic = "force-dynamic";

export default async function PaginaEditarProducto({
  params,
}: PageProps<"/productos/[id]/editar">) {
  const { id } = await params;
  const productoId = Number(id);
  if (!Number.isInteger(productoId)) notFound();

  const [producto, categorias] = await Promise.all([
    obtenerProducto(productoId),
    listarCategorias(),
  ]);
  if (!producto) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Editar producto</h1>
      <FormularioProducto
        categorias={categorias}
        accion={actualizarProducto}
        producto={producto}
      />
      <NuevaCategoria />

      <form action={desactivarProducto} className="mt-4 border-t border-slate-200 pt-4">
        <input type="hidden" name="id" value={producto.id} />
        <p className="text-sm text-slate-500">
          Al eliminarlo desaparece de la lista, pero su historial de movimientos se
          conserva.
        </p>
        <button
          type="submit"
          className="mt-2 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Eliminar producto
        </button>
      </form>
    </div>
  );
}
