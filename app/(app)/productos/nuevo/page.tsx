import { FormularioProducto } from "@/components/FormularioProducto";
import { NuevaCategoria } from "@/components/NuevaCategoria";
import { crearProducto } from "@/lib/actions/productos";
import { listarCategorias } from "@/lib/consultas";

// Sin esto, Next.js pre-renderiza esta pagina una sola vez en el momento del
// deploy y la lista de categorias queda congelada con lo que hubiera en la
// base en ese instante, ignorando las categorias que se agreguen despues.
export const dynamic = "force-dynamic";

export default async function PaginaNuevoProducto() {
  const categorias = await listarCategorias();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-900">Nuevo producto</h1>
      <FormularioProducto categorias={categorias} accion={crearProducto} />
      <NuevaCategoria />
    </div>
  );
}
