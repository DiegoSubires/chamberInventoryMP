// src/pages/BatchDetail/BatchDetail.state.ts
import { useState, useCallback, useMemo } from "react";
import { type BatchLine, type Product } from "../../types/product.types";
import { updateBatchLineInList } from "./BatchDetail.state.utils";

export function useBatchDetailState(initialProduct: Product | null) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [batchLines, setBatchLines] = useState<BatchLine[]>(
    initialProduct?.batchLines ?? [],
  );

  const [initialLines, setInitialLines] = useState<BatchLine[]>([]);

  // Hidratar el estado cuando los efectos terminen la carga asíncrona
  const hydrateState = useCallback((data: Product) => {
    setProduct(data);
    setBatchLines(data.batchLines || []);
    setInitialLines(JSON.parse(JSON.stringify(data.batchLines || [])));
  }, []);

  const updateField = (
    id: string,
    field: keyof BatchLine,
    value: string,
    unitsPerCrate: number,
  ) => {
    setBatchLines((prevLines) =>
      updateBatchLineInList(prevLines, id, field, value, unitsPerCrate),
    );
  };

  // Añadir una nueva línea de lote en blanco con ID único
  const addBatchRow = () => {
    const newLine: BatchLine = {
      id: crypto.randomUUID(),
      batchCode: "",
      packingDate: new Date().toISOString().split("T")[0],
      elapsedDays: 0,
      crates: 0,
      looseUnits: 0,
      quantity: 0,
    };
    setBatchLines((prev) => [...prev, newLine]);
  };

  // Eliminar una línea del listado por su ID temporal o real
  const removeBatchRow = (id: string) => {
    setBatchLines((prev) => prev.filter((line) => line.id !== id));
  };

  // ✨ Calculamos el sumatorio total de bandejas acumuladas dinámicamente
  const grandTotalUnits = useMemo(() => {
    return batchLines.reduce((acc, line) => acc + (line.quantity || 0), 0);
  }, [batchLines]);

  const isDirty = useMemo(() => {
    return JSON.stringify(batchLines) !== JSON.stringify(initialLines);
  }, [batchLines, initialLines]);

  // 🎯 CRÍTICO: Retornamos el objeto unificado para que la UI pueda desestructurarlo o leerlo
  return {
    product,
    batchLines,
    grandTotalUnits,
    hydrateState,
    updateField,
    addBatchRow,
    removeBatchRow,
    isDirty,
  };
}
