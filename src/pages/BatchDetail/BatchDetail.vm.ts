import { type BatchLine } from "../../types/product.types";

export interface BatchDetailProps {
  productId: string;
  tenantId: string;
  onBack?: () => void;
  onRegisterSaveAction: (fn: () => Promise<void>) => void;
}

export const Empty_Line: BatchLine = {
  id: "new-batch-placeholder",
  batch: "",
  packingDate: "",
  elapsedDays: 0,
  crates: 0,
  looseUnits: 0,
  quantity: 0,
};
