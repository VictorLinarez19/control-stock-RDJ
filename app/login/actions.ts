"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_SESION,
  OPCIONES_COOKIE,
  crearValorSesion,
  verificarContrasena,
} from "@/lib/session";

export type EstadoLogin = { error?: string };

export async function entrar(
  _anterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const clave = String(formData.get("clave") ?? "");

  if (!verificarContrasena(clave)) {
    return { error: "Contrasena incorrecta." };
  }

  const { valor, vence } = await crearValorSesion();
  const almacen = await cookies();
  almacen.set(COOKIE_SESION, valor, { ...OPCIONES_COOKIE, expires: vence });

  redirect("/");
}

export async function salir() {
  const almacen = await cookies();
  almacen.delete(COOKIE_SESION);
  redirect("/login");
}
