// src/components/BatchRow/BatchRow.vm.ts

import { type BatchLine } from "../../types/product.types";

export interface BatchRowProps {
  linea: BatchLine;
  unitsPerCrate?: number;
  index: number;
  onChangeField: (id: string, field: keyof BatchLine, value: string) => void;
  onRemove: (id: string) => void;
  isCreator?: boolean;
  onAdd?: () => void;
}

export interface BatchRowFieldsProps {
  linea: BatchLine;
  onChangeField: (id: string, field: keyof BatchLine, value: string) => void;
}
