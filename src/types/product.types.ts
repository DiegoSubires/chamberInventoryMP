export interface BatchLine {
  id?: string;
  batchCode: string;
  packingDate: string;
  elapsedDays: number;
  crates: number;
  looseUnits: number;
  totalUnits: number;
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
  totalQuantity?: number;
}
