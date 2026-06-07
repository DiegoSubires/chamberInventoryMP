import { type ProductDetail } from "./BatchDetail.vm";
import { type BatchLine } from "../../components/BatchRow/BatchRow.vm";

interface ApiBatch {
  id?: unknown;
  batchCode?: unknown;
  packingDate?: unknown;
  elapsedDays?: unknown;
  crates?: unknown;
  looseUnits?: unknown;
  totalUnits?: unknown;
}

interface ApiProduct {
  _id?: unknown;
  id?: unknown;
  code?: unknown;
  description?: unknown;
  alternativeDescription?: unknown;
  category?: unknown;
  unitsPerCrate?: unknown;
  batches?: unknown;
}

export function mapApiToProductDetail(
  apiData: unknown,
  productId: string,
): ProductDetail | null {
  if (!apiData) return null;

  const dataArray = Array.isArray(apiData)
    ? (apiData as ApiProduct[])
    : [apiData as ApiProduct];
  const found = dataArray.find((p) => String(p._id || p.id) === productId);

  if (!found) return null;

  const rawBatches = Array.isArray(found.batches)
    ? (found.batches as ApiBatch[])
    : [];

  const mappedBatches: BatchLine[] = rawBatches.map((item) => {
    // Convertimos de forma segura a número para cumplir con la interfaz estricta de BatchRow
    const safeCrates =
      item.crates !== undefined && item.crates !== null
        ? Number(item.crates)
        : 0;
    const safeLooseUnits =
      item.looseUnits !== undefined && item.looseUnits !== null
        ? Number(item.looseUnits)
        : 0;

    return {
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      batchCode: typeof item.batchCode === "string" ? item.batchCode : "",
      packingDate:
        typeof item.packingDate === "string"
          ? item.packingDate
          : new Date().toISOString().split("T")[0],
      elapsedDays: typeof item.elapsedDays === "number" ? item.elapsedDays : 0,
      crates: isNaN(safeCrates) ? 0 : safeCrates, // 🎯 Forzado a number puro
      looseUnits: isNaN(safeLooseUnits) ? 0 : safeLooseUnits, // 🎯 Forzado a number puro
      totalUnits: typeof item.totalUnits === "number" ? item.totalUnits : 0,
    };
  });

  return {
    id: String(found._id || found.id || ""),
    code: typeof found.code === "string" ? found.code : "",
    description: typeof found.description === "string" ? found.description : "",
    alternativeDescription:
      typeof found.alternativeDescription === "string"
        ? found.alternativeDescription
        : "",
    category: typeof found.category === "string" ? found.category : "GRANEL",
    unitsPerCrate:
      typeof found.unitsPerCrate === "number" ? found.unitsPerCrate : 1,
    batches: mappedBatches,
  };
}
