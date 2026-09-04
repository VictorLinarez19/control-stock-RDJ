// Sesion minima: una sola contrasena compartida, guardada en una cookie firmada.
// Usa Web Crypto (no `node:crypto`) para que tambien funcione dentro del middleware.

export const COOKIE_SESION = "stock_sesion";

const DURACION_DIAS = 30;
const DURACION_MS = DURACION_DIAS * 24 * 60 * 60 * 1000;

function leerSecreto(): string {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto) {
    throw new Error("Falta la variable de entorno SESSION_SECRET");
  }
  return secreto;
}

async function firmar(mensaje: string): Promise<string> {
  const clave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(leerSecreto()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", clave, new TextEncoder().encode(mensaje));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/// Comparacion en tiempo constante: no corta al primer caracter distinto, para
/// no filtrar informacion sobre el valor esperado.
function igualesSeguro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) {
    diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diferencia === 0;
}

export function verificarContrasena(intento: string): boolean {
  const esperada = process.env.APP_PASSWORD;
  if (!esperada) {
    throw new Error("Falta la variable de entorno APP_PASSWORD");
  }
  return igualesSeguro(intento, esperada);
}

/// Devuelve el valor a guardar en la cookie: "<vence>.<firma>".
export async function crearValorSesion(): Promise<{ valor: string; vence: Date }> {
  const vence = new Date(Date.now() + DURACION_MS);
  const marca = String(vence.getTime());
  return { valor: `${marca}.${await firmar(marca)}`, vence };
}

export async function sesionValida(valor: string | undefined): Promise<boolean> {
  if (!valor) return false;
  const [marca, firma] = valor.split(".");
  if (!marca || !firma) return false;

  const vence = Number(marca);
  if (!Number.isFinite(vence) || vence < Date.now()) return false;

  return igualesSeguro(firma, await firmar(marca));
}

export const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;
