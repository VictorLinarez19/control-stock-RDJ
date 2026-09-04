"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { entrar, type EstadoLogin } from "./actions";

function BotonEntrar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export default function PaginaLogin() {
  const [estado, accion] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
      <form
        action={accion}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >
        <h1 className="text-xl font-semibold text-slate-900">Control de stock</h1>
        <p className="mt-1 text-sm text-slate-500">Ingresa la contrasena para continuar.</p>

        <label htmlFor="clave" className="mt-6 block text-sm font-medium text-slate-700">
          Contrasena
        </label>
        <input
          id="clave"
          name="clave"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base outline-none focus:border-slate-900"
        />

        {estado.error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {estado.error}
          </p>
        ) : null}

        <div className="mt-6">
          <BotonEntrar />
        </div>
      </form>
    </main>
  );
}
