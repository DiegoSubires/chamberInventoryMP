import { type BatchLine } from "../../components/BatchRow/BatchRow.vm";

/**
 * Calcula de forma segura el total físico de unidades basándose en el factor de la caja
 */
export function calculateLineTotal(
  crates: number,
  looseUnits: number,
  unitsPerCrate: number,
): number {
  return crates * unitsPerCrate + looseUnits;
}

/**
 * Modifica un campo dinámico dentro de una línea específica recalculando sus unidades sin usar 'any'
 */
export const updateBatchLineInList = (
  lines: BatchLine[],
  id: string,
  field: keyof BatchLine,
  value: string,
  unitsPerCrate: number,
): BatchLine[] => {
  return lines.map((line) => {
    if (line.id !== id) return line;

    // 1. Creamos la base con el cambio introducido
    const updatedLine = { ...line, [field]: value };

    // 2. Si cambia la fecha, calculamos los días automáticamente
    if (field === "packingDate") {
      updatedLine.elapsedDays = calculateElapsedDays(value);
    }

    // 3. Recalculamos el total (manteniendo tu lógica actual)
    updatedLine.totalUnits =
      Number(updatedLine.crates) * unitsPerCrate +
      Number(updatedLine.looseUnits);

    return updatedLine;
  });
};

export const calculateElapsedDays = (packingDateStr: string): number => {
  if (!packingDateStr) return 0;

  const hoy = new Date();
  const fechaEnvasado = new Date(packingDateStr);

  // Ponemos ambas fechas a las 00:00:00 para evitar desfases por horas/minutos
  hoy.setHours(0, 0, 0, 0);
  fechaEnvasado.setHours(0, 0, 0, 0);

  const diferenciaMilisegundos = hoy.getTime() - fechaEnvasado.getTime();

  // Convertimos milisegundos a días (1 día = 24h * 60m * 60s * 1000ms)
  const dias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));

  // Si la fecha es futura por error del usuario, devolvemos 0
  return dias > 0 ? dias : 0;
};
