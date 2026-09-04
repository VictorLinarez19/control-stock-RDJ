import { FormularioProducto } from "@/components/FormularioProducto";
import { NuevaCategoria } from "@/components/NuevaCategoria";
import { crearProducto } from "@/lib/actions/productos";
import { listarCategorias } from "@/lib/consultas";

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
