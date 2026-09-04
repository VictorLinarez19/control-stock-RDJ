"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TipoMovimiento } from "@/lib/generated/prisma/enums";

export type EstadoMovimiento = { error?: string; ok?: boolean };

const TIPOS_VALIDOS = new Set<string>(Object.values(TipoMovimiento));

/// Unico camino por el que cambia el stock de un producto. Nunca se edita
/// `cantidadStock` por fuera de aca: el contador y el historial se escriben
/// juntos dentro de una transaccion, asi no pueden quedar desincronizados.
export async function registrarMovimiento(
  _anterior: EstadoMovimiento,
  formData: FormData,
): Promise<EstadoMovimiento> {
  const productoId = Number(formData.get("productoId"));
  const tipoCrudo = String(formData.get("tipo") ?? "");
  const cantidad = Number(formData.get("cantidad"));
  const nota = String(formData.get("nota") ?? "").trim() || null;

  if (!Number.isInteger(productoId) || productoId <= 0) {
    return { error: "Producto invalido." };
  }
  if (!TIPOS_VALIDOS.has(tipoCrudo)) {
    return { error: "Tipo de movimiento invalido." };
  }
  const tipo = tipoCrudo as TipoMovimiento;

  if (!Number.isInteger(cantidad) || cantidad < 0) {
    return { error: "La cantidad debe ser un numero entero." };
  }
  if (tipo !== TipoMovimiento.AJUSTE && cantidad <= 0) {
    return { error: "La cantidad debe ser mayor que cero." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUniqueOrThrow({ where: { id: productoId } });

      // En un ajuste la cantidad es el stock real contado, no un delta.
      const nuevoStock = tipo === TipoMovimiento.AJUSTE
        ? cantidad
        : producto.cantidadStock + (tipo === TipoMovimiento.SALIDA ? -cantidad : cantidad);

      if (nuevoStock < 0) {
        throw new StockInsuficiente(producto.cantidadStock);
      }

      await tx.producto.update({
        where: { id: productoId },
        data: { cantidadStock: nuevoStock },
      });

      await tx.movimiento.create({
        data: {
          productoId,
          tipo,
          cantidad,
          // Guardamos el precio vigente al momento de la venta: no cuesta nada
          // ahora y es lo que permitira sacar reportes mas adelante.
          precioUnitario: tipo === TipoMovimiento.SALIDA ? producto.precioVenta : null,
          nota,
        },
      });
    });
  } catch (error) {
    if (error instanceof StockInsuficiente) {
      return { error: `Stock insuficiente: solo hay ${error.disponible} unidades.` };
    }
    console.error(error);
    return { error: "No se pudo registrar el movimiento." };
  }

  revalidatePath("/");
  revalidatePath(`/productos/${productoId}`);
  return { ok: true };
}

class StockInsuficiente extends Error {
  constructor(readonly disponible: number) {
    super("Stock insuficiente");
  }
}
