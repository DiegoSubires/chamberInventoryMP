// src/components/BatchRow/BatchRow.tsx

import React from "react";
import { type BatchRowProps } from "./BatchRow.vm";
import { BatchRowFields } from "./BatchRowFields";
import styles from "./BatchRow.module.scss";

export const BatchRow: React.FC<BatchRowProps> = ({
  linea,
  index,
  onChangeField,
  onRemove,
  isCreator = false,
  onAdd,
}) => {
  if (isCreator) {
    return (
      <div className={styles.industrialBatchCardCreator} onClick={onAdd}>
        <span className={styles.batchTitleNumber}>Nuevo Lote</span>
        <button
          type="button"
          className={styles.giantBlueAddButtonInline}
          onClick={(e) => {
            e.stopPropagation();
            if (onAdd) onAdd();
          }}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <div className={styles.industrialBatchCard}>
      <div className={styles.cardBatchHeader}>
        <span className={styles.batchTitleNumber}>Lote #{index + 1}</span>
        <button
          type="button"
          className={styles.deleteIconButton}
          onClick={() => onRemove(linea.id ?? "")}
          title="Eliminar este lote"
        >
          🗑️
        </button>
      </div>

      {/* Bloque con todos los campos en formato etiqueta-izquierda / input-derecha */}
      <BatchRowFields linea={linea} onChangeField={onChangeField} />
    </div>
  );
};
