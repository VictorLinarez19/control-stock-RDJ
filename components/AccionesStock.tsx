"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { registrarMovimiento, type EstadoMovimiento } from "@/lib/actions/movimientos";

type Producto = { id: number; nombre: string; cantidadStock: number };
type Tipo = "ENTRADA" | "SALIDA" | "AJUSTE";

const TEXTOS: Record<Tipo, { titulo: string; etiqueta: string; boton: string }> = {
  ENTRADA: {
    titulo: "Entrada de mercancia",
    etiqueta: "Cantidad que llego",
    boton: "Agregar al stock",
  },
  SALIDA: {
    titulo: "Registrar venta",
    etiqueta: "Cantidad vendida",
    boton: "Registrar venta",
  },
  AJUSTE: {
    titulo: "Ajustar inventario",
    etiqueta: "Cantidad real contada",
    boton: "Corregir stock",
  },
};

export function AccionesStock({ producto }: { producto: Producto }) {
  const [abierto, setAbierto] = useState<Tipo | null>(null);

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAbierto("ENTRADA")}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + Entrada
        </button>
        <button
          type="button"
          onClick={() => setAbierto("SALIDA")}
          className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          − Venta
        </button>
        <button
          type="button"
          onClick={() => setAbierto("AJUSTE")}
          aria-label={`Ajustar inventario de ${producto.nombre}`}
          title="Ajustar inventario"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100"
        >
          Ajustar
        </button>
      </div>

      {abierto ? (
        <ModalMovimiento
          tipo={abierto}
          producto={producto}
          onCerrar={() => setAbierto(null)}
        />
      ) : null}
    </>
  );
}

function ModalMovimiento({
  tipo,
  producto,
  onCerrar,
}: {
  tipo: Tipo;
  producto: Producto;
  onCerrar: () => void;
}) {
  const [estado, accion] = useActionState<EstadoMovimiento, FormData>(
    registrarMovimiento,
    {},
  );
  const textos = TEXTOS[tipo];

  useEffect(() => {
    if (estado.ok) onCerrar();
  }, [estado.ok, onCerrar]);

  useEffect(() => {
    function alPresionar(evento: KeyboardEvent) {
      if (evento.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCerrar]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={textos.titulo}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-lg sm:rounded-2xl"
      >
        <h2 className="text-lg font-semibold text-slate-900">{textos.titulo}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {producto.nombre} — hay {producto.cantidadStock} en stock
        </p>

        <form action={accion} className="mt-4">
          <input type="hidden" name="productoId" value={producto.id} />
          <input type="hidden" name="tipo" value={tipo} />

          <label htmlFor="cantidad" className="block text-sm font-medium text-slate-700">
            {textos.etiqueta}
          </label>
          <input
            id="cantidad"
            name="cantidad"
            type="number"
            min={tipo === "AJUSTE" ? 0 : 1}
            step={1}
            required
            autoFocus
            defaultValue={tipo === "AJUSTE" ? producto.cantidadStock : ""}
            inputMode="numeric"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-lg outline-none focus:border-slate-900"
          />

          <label htmlFor="nota" className="mt-4 block text-sm font-medium text-slate-700">
            Nota <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="nota"
            name="nota"
            type="text"
            placeholder={tipo === "ENTRADA" ? "Proveedor, factura..." : "Cliente, detalle..."}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-slate-900"
          />

          {estado.error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {estado.error}
            </p>
          ) : null}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <BotonGuardar texto={textos.boton} />
          </div>
        </form>
      </div>
    </div>
  );
}

function BotonGuardar({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Guardando..." : texto}
    </button>
  );
}
