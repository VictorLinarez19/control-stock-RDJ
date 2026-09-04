"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TipoMovimiento } from "@/lib/generated/prisma/enums";

export type EstadoProducto = { error?: string };

type Campos = {
  nombre: string;
  codigo: string;
  categoriaId: number;
  compatibilidad: string | null;
  costo: string | null;
  precioVenta: string;
  stockMinimo: number;
};

/// Lee un importe del formulario. Devuelve la cadena normalizada ("12.50"),
/// no un `number`, para entregarsela a Prisma sin pasar por un float.
function leerImporte(valor: FormDataEntryValue | null): string | null {
  const texto = String(valor ?? "").trim().replace(",", ".");
  if (!texto) return null;
  const numero = Number(texto);
  if (!Number.isFinite(numero) || numero < 0) return null;
  return numero.toFixed(2);
}

function leerEntero(valor: FormDataEntryValue | null, porDefecto = 0): number {
  const numero = Number(String(valor ?? "").trim());
  if (!Number.isInteger(numero) || numero < 0) return porDefecto;
  return numero;
}

function leerCampos(formData: FormData): Campos | string {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const codigo = String(formData.get("codigo") ?? "").trim();
  const categoriaId = Number(formData.get("categoriaId"));
  const precioVenta = leerImporte(formData.get("precioVenta"));

  if (!nombre) return "El nombre es obligatorio.";
  if (!codigo) return "El codigo es obligatorio.";
  if (!Number.isInteger(categoriaId) || categoriaId <= 0) return "Elegi una categoria.";
  if (precioVenta === null) return "El precio de venta es obligatorio y no puede ser negativo.";

  return {
    nombre,
    codigo,
    categoriaId,
    compatibilidad: String(formData.get("compatibilidad") ?? "").trim() || null,
    costo: leerImporte(formData.get("costo")),
    precioVenta,
    stockMinimo: leerEntero(formData.get("stockMinimo")),
  };
}

function esCodigoDuplicado(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function crearProducto(
  _anterior: EstadoProducto,
  formData: FormData,
): Promise<EstadoProducto> {
  const campos = leerCampos(formData);
  if (typeof campos === "string") return { error: campos };

  const cantidadInicial = leerEntero(formData.get("cantidadInicial"));

  try {
    await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: { ...campos, cantidadStock: cantidadInicial },
      });

      // El stock inicial tambien queda como movimiento, para que el historial
      // explique de donde salio cada unidad.
      if (cantidadInicial > 0) {
        await tx.movimiento.create({
          data: {
            productoId: producto.id,
            tipo: TipoMovimiento.ENTRADA,
            cantidad: cantidadInicial,
            nota: "Stock inicial",
          },
        });
      }
    });
  } catch (error) {
    if (esCodigoDuplicado(error)) {
      return { error: `Ya existe un producto con el codigo "${campos.codigo}".` };
    }
    console.error(error);
    return { error: "No se pudo crear el producto." };
  }

  revalidatePath("/");
  redirect("/");
}

export async function actualizarProducto(
  _anterior: EstadoProducto,
  formData: FormData,
): Promise<EstadoProducto> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return { error: "Producto invalido." };

  const campos = leerCampos(formData);
  if (typeof campos === "string") return { error: campos };

  try {
    // El stock no se edita aca: solo cambia a traves de movimientos.
    await prisma.producto.update({ where: { id }, data: campos });
  } catch (error) {
    if (esCodigoDuplicado(error)) {
      return { error: `Ya existe un producto con el codigo "${campos.codigo}".` };
    }
    console.error(error);
    return { error: "No se pudo guardar el producto." };
  }

  revalidatePath("/");
  revalidatePath(`/productos/${id}`);
  redirect("/");
}

/// Baja logica: el producto sale de la lista pero sus movimientos siguen ahi.
export async function desactivarProducto(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await prisma.producto.update({ where: { id }, data: { activo: false } });
  revalidatePath("/");
  redirect("/");
}

export async function crearCategoria(
  _anterior: EstadoProducto,
  formData: FormData,
): Promise<EstadoProducto> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { error: "Escribi un nombre para la categoria." };

  try {
    await prisma.categoria.create({ data: { nombre } });
  } catch (error) {
    if (esCodigoDuplicado(error)) {
      return { error: `La categoria "${nombre}" ya existe.` };
    }
    console.error(error);
    return { error: "No se pudo crear la categoria." };
  }

  // "layout" revalida todas las rutas: el selector de categorias aparece tanto
  // en la lista como en los formularios de alta y edicion.
  revalidatePath("/", "layout");
  return {};
}
