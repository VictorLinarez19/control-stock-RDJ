// Formato de dinero y fechas en un solo lugar, para poder cambiar la moneda
// del negocio tocando unicamente este archivo.

const LOCALE = "es";

const formatoDinero = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearDinero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return `$${formatoDinero.format(valor)}`;
}

const formatoFecha = new Intl.DateTimeFormat(LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatearFecha(fecha: Date): string {
  return formatoFecha.format(fecha);
}
