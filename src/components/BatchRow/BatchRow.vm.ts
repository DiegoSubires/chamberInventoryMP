// src/components/BatchRow/BatchRow.vm.ts

export interface BatchLine {
  id: string;
  batchCode: string;
  packingDate: string;
  elapsedDays: number;
  crates: number;
  looseUnits: number;
  totalUnits: number;
}

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
