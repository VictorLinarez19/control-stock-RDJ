"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type Categoria = { id: number; nombre: string };

export function FiltrosProductos({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, iniciarTransicion] = useTransition();

  const busquedaUrl = params.get("q") ?? "";
  const categoriaUrl = params.get("categoria") ?? "";
  const [busqueda, setBusqueda] = useState(busquedaUrl);

  // El input se controla localmente y recien despues de 300 ms sin teclear se
  // refleja en la URL, para no lanzar una consulta por cada letra.
  useEffect(() => {
    if (busqueda === busquedaUrl) return;

    const temporizador = setTimeout(() => {
      const nuevos = new URLSearchParams(params.toString());
      if (busqueda) nuevos.set("q", busqueda);
      else nuevos.delete("q");
      iniciarTransicion(() => router.replace(`/?${nuevos.toString()}`));
    }, 300);

    return () => clearTimeout(temporizador);
  }, [busqueda, busquedaUrl, params, router]);

  function cambiarCategoria(valor: string) {
    const nuevos = new URLSearchParams(params.toString());
    if (valor) nuevos.set("categoria", valor);
    else nuevos.delete("categoria");
    iniciarTransicion(() => router.replace(`/?${nuevos.toString()}`));
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, codigo o carro..."
        aria-label="Buscar productos"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-slate-900"
      />
      <select
        value={categoriaUrl}
        onChange={(e) => cambiarCategoria(e.target.value)}
        aria-label="Filtrar por categoria"
        className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-slate-900 sm:w-56"
      >
        <option value="">Todas las categorias</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}
