export interface BatchLine {
  id?: string;
  batch: string;
  packingDate: string | null;
  elapsedDays: number;
  crates: number;
  looseUnits: number;
  quantity: number;
}

export interface Product {
  id: string;
  code?: string;
  description?: string;
  alternativeDescription: string;
  category?: string;
  subcategory?: string;
  unitsPerCrate?: number;
  totalCrates?: number;
  batchLines?: BatchLine[];
  sortOrder?: number;
  totalUnits?: number;
  visible?: boolean;
  quantity?: number;
  totalQuantity?: number;
}
