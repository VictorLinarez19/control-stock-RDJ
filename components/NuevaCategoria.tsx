"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { crearCategoria, type EstadoProducto } from "@/lib/actions/productos";

export function NuevaCategoria() {
  const [estado, accion] = useActionState<EstadoProducto, FormData>(crearCategoria, {});
  const [abierto, setAbierto] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  // Al crearse bien, la accion devuelve un estado vacio: limpiamos el campo
  // para poder agregar otra sin recargar.
  useEffect(() => {
    if (!estado.error) formulario.current?.reset();
  }, [estado]);

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-sm text-slate-600 underline hover:text-slate-900"
      >
        Falta una categoria? Agregala aca
      </button>
    );
  }

  return (
    <form ref={formulario} action={accion} className="flex flex-wrap items-end gap-2">
      <div className="min-w-48 flex-1">
        <label htmlFor="nombreCategoria" className="block text-sm font-medium text-slate-700">
          Nueva categoria
        </label>
        <input
          id="nombreCategoria"
          name="nombre"
          required
          autoFocus
          placeholder="Amortiguadores"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-slate-900"
        />
      </div>
      <BotonAgregar />
      {estado.error ? (
        <p className="w-full text-sm text-red-600" role="alert">
          {estado.error}
        </p>
      ) : null}
    </form>
  );
}

function BotonAgregar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-slate-300 px-4 py-2.5 text-base text-slate-700 hover:bg-slate-100 disabled:opacity-50"
    >
      {pending ? "Agregando..." : "Agregar"}
    </button>
  );
}
