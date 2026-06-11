// src/components/BatchRow/BatchRowFields.tsx

import React from "react";
import { type BatchRowFieldsProps } from "./BatchRow.vm";
import { BatchCodeInput } from "./BatchCodeInput";
import styles from "./BatchRow.module.scss";

export const BatchRowFields: React.FC<BatchRowFieldsProps> = ({
  linea,
  onChangeField,
}) => {
  return (
    <div className={styles.verticalFormBody}>
      {/* Lote (DDMM/OO) */}
      <BatchCodeInput
        value={linea.batchCode}
        onChange={(val) => onChangeField(linea.id ?? "", "batchCode", val)}
      />

      {/* F. Envasado (con calendario nativo) */}
      <div className={styles.horizontalInputGroup}>
        <label className={styles.shortLabel}>F. Envasado</label>
        <input
          type="date"
          className={styles.darkInput}
          value={linea.packingDate || ""}
          onChange={(e) =>
            onChangeField(linea.id ?? "", "packingDate", e.target.value)
          }
        />
      </div>

      {/* Días en cámara */}
      <div className={styles.horizontalInputGroup}>
        <label className={styles.shortLabel}>Días cámara</label>
        <input
          type="number"
          className={styles.darkInput}
          placeholder="0"
          value={linea.elapsedDays ?? 0}
          readOnly
          disabled
        />
      </div>

      {/* Cajas */}
      <div className={styles.horizontalInputGroup}>
        <label className={styles.shortLabel}>Cajas</label>
        <input
          type="number"
          className={styles.darkInput}
          placeholder="0"
          value={linea.crates || ""}
          onChange={(e) =>
            onChangeField(linea.id ?? "", "crates", e.target.value)
          }
        />
      </div>

      {/* Bandejas Sueltas */}
      <div className={styles.horizontalInputGroup}>
        <label className={styles.shortLabel}>Bandejas sueltas</label>
        <input
          type="number"
          className={styles.darkInput}
          placeholder="0"
          value={linea.looseUnits || ""}
          onChange={(e) =>
            onChangeField(linea.id ?? "", "looseUnits", e.target.value)
          }
        />
      </div>

      {/* Total Lote */}
      <div className={styles.horizontalInputGroup}>
        <label className={styles.shortLabel}>Total Lote</label>
        <div className={styles.totalCalculadoBadge}>
          {linea.totalUnits || 0} unds
        </div>
      </div>
    </div>
  );
};
