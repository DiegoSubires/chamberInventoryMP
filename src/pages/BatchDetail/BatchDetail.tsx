// src/pages/BatchDetail/BatchDetail.tsx
import { useState, useEffect, useCallback } from "react";
import { BatchRow } from "../../components/BatchRow/BatchRow";
import { useBatchDetailState } from "./BatchDetail.state";
import { useBatchDetailEffects } from "./BatchDetail.effects";
import { InventoryService } from "../../services";
import { type BatchLine } from "../../types/product.types";
import { type BatchDetailProps, Empty_Line } from "./BatchDetail.vm";
import styles from "./BatchDetail.module.scss";

export default function BatchDetail({
  productId,
  tenantId,
  operatorName,
  //onBack,
  onRegisterSaveAction,
}: BatchDetailProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Inicializamos el hook de estado
  const state = useBatchDetailState(null, operatorName || "Invitado");

  useEffect(() => {
    console.log("🔍 [3. Estado actual en el componente]:", state);
  }, [state]);

  const workingDate =
    localStorage.getItem("chamber_inventory_working_date") ||
    new Date().toISOString().split("T")[0];

  // Disparamos la carga asíncrona de las especificaciones del artículo
  useBatchDetailEffects({
    productId,
    tenantId,
    workingDate,
    setLoading,
    hydrateState: state.hydrateState,
  });

  const handleSaveProductBatches = useCallback(async () => {
    // ⚡ Solo ejecutamos la escritura en Atlas si el operario alteró celdas
    if (state.isDirty) {
      setIsSaving(true);
      try {
        // Guardamos y esperamos la confirmación del servidor/MongoDB
        await InventoryService.saveProductBatches(
          tenantId,
          productId,
          workingDate,
          state.batchLines,
          operatorName,
        );

        // Despachamos evento global para forzar al catálogo de Home a refrescar totales
        window.dispatchEvent(new Event("refresh-chamber-inventory"));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("❌ Error persistiendo cambios del lote:", error.message);
        if (error.response) {
          console.error("Detalles del servidor:", await error.response.json());
        }
        alert("Error de red: No se pudo consolidar el borrador en Atlas.");
        throw error; // Propagamos el error para mitigar cierres en falso
      } finally {
        setIsSaving(false);
      }
    }
  }, [
    state.isDirty,
    state.batchLines,
    tenantId,
    productId,
    workingDate,
    operatorName,
  ]);

  // 🔌 2. Registramos la función de guardado en el estado centralizado del padre
  useEffect(() => {
    onRegisterSaveAction(handleSaveProductBatches);
  }, [handleSaveProductBatches, onRegisterSaveAction]);

  // 🛡️ CONTROL DE SEGURIDAD 1: Si está cargando por primera vez, mostramos el spinner
  if (loading && !state.product) {
    return (
      <div className={styles.loading}>
        Cargando especificaciones del artículo...
      </div>
    );
  }

  // 🛡️ CONTROL DE SEGURIDAD 2: Si terminó de cargar pero el producto sigue nulo
  if (!state.product) {
    return (
      <div className={styles.errorContainer}>
        <p>
          No se pudo recuperar la información del producto de la base de datos.
        </p>
        {/* El botón local desaparece porque el botón "Guardar y Volver" de la barra superior sigue estando disponible para salir */}
      </div>
    );
  }

  return (
    <div
      className={`${styles.detailWrapper} ${isSaving ? styles.viewDisabling : ""}`}
    >
      {/* Cabecera del Detalle: Limpia de botones redundantes, enfocada en los metadatos */}
      <div className={styles.detailHeader}>
        <div className={styles.productMeta}>
          <span className={styles.productCode}>{state.product.code}</span>
          <h1 className={styles.productTitle}>{state.product.description}</h1>
        </div>
      </div>

      <div className={styles.mainContentLayout}>
        <div className={styles.mainLayoutGrid}>
          <div className={styles.batchesSection}>
            {state.batchLines.map((line, index) => (
              <BatchRow
                key={line.id}
                linea={line}
                index={index}
                unitsPerCrate={state.product!.unitsPerCrate}
                onChangeField={(
                  id: string,
                  field: keyof BatchLine,
                  value: string,
                ) =>
                  state.updateField(
                    id,
                    field,
                    value,
                    state.product!.unitsPerCrate ?? 0,
                  )
                }
                onRemove={(id: string) => state.removeBatchRow(id)}
              />
            ))}

            {/* Fila vacía para añadir nuevos lotes en caliente */}
            {!isSaving && (
              <BatchRow
                isCreator
                onAdd={state.addBatchRow}
                linea={Empty_Line}
                index={state.batchLines.length}
                onChangeField={() => {}}
                onRemove={() => {}}
              />
            )}
          </div>
        </div>

        <div className={styles.formFooterOnlyTotals}>
          <span className={styles.totalLabel}>
            Total Unidades de este Artículo:
          </span>
          <strong className={styles.totalValue}>
            {state.grandTotalUnits} unds
          </strong>
        </div>
      </div>
    </div>
  );
}
