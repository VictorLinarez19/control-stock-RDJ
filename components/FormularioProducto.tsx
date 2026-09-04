"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoProducto } from "@/lib/actions/productos";
import type { ProductoVista } from "@/lib/consultas";

type Categoria = { id: number; nombre: string };

type Props = {
  categorias: Categoria[];
  accion: (anterior: EstadoProducto, formData: FormData) => Promise<EstadoProducto>;
  producto?: ProductoVista;
};

const CLASE_CAMPO =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-slate-900";
const CLASE_ETIQUETA = "block text-sm font-medium text-slate-700";

export function FormularioProducto({ categorias, accion, producto }: Props) {
  const [estado, enviar] = useActionState<EstadoProducto, FormData>(accion, {});
  const editando = producto !== undefined;

  return (
    <form action={enviar} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
      {editando ? <input type="hidden" name="id" value={producto.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nombre" className={CLASE_ETIQUETA}>
            Nombre del repuesto
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            autoFocus
            defaultValue={producto?.nombre}
            placeholder="Rodamiento delantero"
            className={CLASE_CAMPO}
          />
        </div>

        <div>
          <label htmlFor="codigo" className={CLASE_ETIQUETA}>
            Codigo / SKU
          </label>
          <input
            id="codigo"
            name="codigo"
            required
            defaultValue={producto?.codigo}
            placeholder="ROD-001"
            className={`${CLASE_CAMPO} font-mono`}
          />
        </div>

        <div>
          <label htmlFor="categoriaId" className={CLASE_ETIQUETA}>
            Categoria
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            required
            defaultValue={producto?.categoriaId ?? ""}
            className={CLASE_CAMPO}
          >
            <option value="" disabled>
              Elegi una categoria
            </option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="compatibilidad" className={CLASE_ETIQUETA}>
            Compatible con <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="compatibilidad"
            name="compatibilidad"
            defaultValue={producto?.compatibilidad ?? ""}
            placeholder="Corolla 2005-2010, Yaris"
            className={CLASE_CAMPO}
          />
        </div>

        <div>
          <label htmlFor="costo" className={CLASE_ETIQUETA}>
            Costo <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="costo"
            name="costo"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            defaultValue={producto?.costo ?? ""}
            className={CLASE_CAMPO}
          />
        </div>

        <div>
          <label htmlFor="precioVenta" className={CLASE_ETIQUETA}>
            Precio de venta
          </label>
          <input
            id="precioVenta"
            name="precioVenta"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            required
            defaultValue={producto?.precioVenta ?? ""}
            className={CLASE_CAMPO}
          />
        </div>

        <div>
          <label htmlFor="stockMinimo" className={CLASE_ETIQUETA}>
            Stock minimo
          </label>
          <input
            id="stockMinimo"
            name="stockMinimo"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            defaultValue={producto?.stockMinimo ?? 0}
            className={CLASE_CAMPO}
          />
          <p className="mt-1 text-xs text-slate-500">
            Debajo de esta cantidad se marca como stock bajo.
          </p>
        </div>

        {editando ? null : (
          <div>
            <label htmlFor="cantidadInicial" className={CLASE_ETIQUETA}>
              Cantidad inicial
            </label>
            <input
              id="cantidadInicial"
              name="cantidadInicial"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={0}
              className={CLASE_CAMPO}
            />
            <p className="mt-1 text-xs text-slate-500">
              Queda registrada como una entrada en el historial.
            </p>
          </div>
        )}
      </div>

      {editando ? (
        <p className="mt-4 text-sm text-slate-500">
          El stock ({producto.cantidadStock}) no se edita aca: cambia con las entradas,
          las ventas y los ajustes.
        </p>
      ) : null}

      {estado.error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {estado.error}
        </p>
      ) : null}

      <div className="mt-6 flex gap-2">
        <Link
          href="/"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-center text-base text-slate-700 hover:bg-slate-100 sm:flex-none"
        >
          Cancelar
        </Link>
        <BotonGuardar texto={editando ? "Guardar cambios" : "Crear producto"} />
      </div>
    </form>
  );
}

function BotonGuardar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-lg bg-slate-900 px-6 py-3 text-base font-medium text-white hover:bg-slate-700 disabled:opacity-50 sm:flex-none"
    >
      {pending ? "Guardando..." : texto}
    </button>
  );
}
