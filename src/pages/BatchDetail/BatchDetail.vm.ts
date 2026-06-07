import { type BatchLine } from "../../components/BatchRow/BatchRow.vm";

export interface ProductDetail {
  id: string;
  code: string;
  description: string;
  alternativeDescription: string;
  category: string;
  unitsPerCrate: number;
  batches: BatchLine[];
}

export interface BatchDetailProps {
  productId: string;
  tenantId: string;
  onBack?: () => void;
  onRegisterSaveAction: (fn: () => Promise<void>) => void;
}

export const Empty_Line: BatchLine = {
  id: "new-batch-placeholder",
  batchCode: "",
  packingDate: "",
  elapsedDays: 0,
  crates: 0,
  looseUnits: 0,
  totalUnits: 0,
};
