// src/pages/BatchDetail/BatchDetail.tsx
import { useState, useEffect, useCallback } from "react";
import { BatchRow } from "../../components/BatchRow/BatchRow";
import { useBatchDetailState } from "./BatchDetail.state";
import { useBatchDetailEffects } from "./BatchDetail.effects";
import { InventoryService } from "../../services";
import { type BatchLine } from "../../components/BatchRow/BatchRow.vm";
import { type BatchDetailProps, Empty_Line } from "./BatchDetail.vm";
import styles from "./BatchDetail.module.scss";

export default function BatchDetail({
  productId,
  tenantId,
  //onBack,
  onRegisterSaveAction,
}: BatchDetailProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Inicializamos el hook de estado
  const state = useBatchDetailState(null);

  const workingDate =
    localStorage.getItem("chamber_inventory_working_date") ||
    new Date().toISOString().split("T")[0];

  // Disparamos la carga asíncrona de las especificaciones del artículo
  useBatchDetailEffects({
    productId,
    tenantId,
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
          state.batchLines, // Enviamos el array completo
        );

        // Despachamos evento global para forzar al catálogo de Home a refrescar totales
        window.dispatchEvent(new Event("refresh-chamber-inventory"));
      } catch (error) {
        console.error("❌ Error persistiendo cambios del lote:", error);
        alert("Error de red: No se pudo consolidar el borrador en Atlas.");
        throw error; // Propagamos el error para mitigar cierres en falso
      } finally {
        setIsSaving(false);
      }
    }
  }, [state.isDirty, state.batchLines, tenantId, productId, workingDate]);

  // 🔌 2. Registramos la función de guardado en el estado centralizado del padre
  useEffect(() => {
    onRegisterSaveAction(handleSaveProductBatches);
  }, [handleSaveProductBatches, onRegisterSaveAction]);

  /*/ Interceptor de navegación hacia atrás: Realiza el Push del borrador hacia MongoDB
  const handleOnBack = async () => {
    console.log(
      "🔍 [LOG 1 - COMPONENTE] Estado original crudo en React (state.batchLines):",
      state.batchLines,
    );
    try {
      setIsSaving(true);

      // 🎯 Filtramos filas vacías, pero mantenemos el tipo BatchLine[] intacto
      const cleanBatchesForService = state.batchLines.filter(
        (line) => line.batchCode.trim() !== "",
      );

      console.log(
        "🔍 [LOG 2 - COMPONENTE] Enviando lotes limpios directamente al Servicio:",
        cleanBatchesForService,
      );

      // 🚀 Enviamos el array sin deformar, cumpliendo estrictamente con BatchLine[]
      await InventoryService.saveProductBatches(
        tenantId,
        productId,
        workingDate,
        cleanBatchesForService, // ✨ Resuelve el error TypeScript (2345)
      );

      console.log(
        "✅ [BatchDetail.tsx] Guardado completado con éxito. Navegando al catálogo.",
      );
      onBack();
    } catch (error) {
      console.error(
        "❌ [BatchDetail.tsx] Error salvando el borrador temporal:",
        error,
      );
      alert(
        "No se pudo guardar el recuento de lotes. Revisa la conexión con el servidor.",
      );
    } finally {
      setIsSaving(false);
    }
  };*/
  // En src/pages/BatchDetail/BatchDetail.tsx

  /*const handleOnBack = async () => {
    /*console.log(
      "%c=== 🛑 INICIO PROCESO SALIDA BATCH_DETAIL ===",
      "background: #222; color: #bada55",
    );
    console.log(
      `🔍 [BatchDetail] productId: ${productId} | isDirty: ${state.isDirty}`,
    );
    console.log(
      "🔍 [BatchDetail] Líneas actuales en el estado de React:",
      state.batchLines,
    );
    console.log(
      `🔍 [BatchDetail] Gran Total calculado en UI: ${state.grandTotalUnits} unds`,
    );/

    // ⚡ Solo ejecutamos la persistencia si el operario "retocó" algún dato
    if (state.isDirty) {
      setIsSaving(true);
      try {
        /*console.log(
          "🚀 [BatchDetail] Enviando líneas al servicio saveProductBatches...",
        );*/
  /*/ Mapeamos las líneas del estado de React al formato del contrato del backend
        const mappedBatches = state.batchLines.map((line) => ({
          batch: line.batchCode,
          quantity: Number(line.totalUnits) || 0,
          crates: Number(line.crates) || 0,
          looseUnits: Number(line.looseUnits) || 0,
          packingDate: line.packingDate,
          elapsedDays: Number(line.elapsedDays) || 0,
        }));/

        // Guardamos y ESPERAMOS a que la promesa se resuelva en el backend
        await InventoryService.saveProductBatches(
          tenantId,
          productId,
          workingDate,
          state.batchLines, // Enviamos el estado completo, el servicio se encargará de filtrar internamente
        );

        // Emitimos la señal de refresco global para que Home se entere de inmediato
        console.log(
          "⚡ [BatchDetail] Guardado exitoso. Despachando evento global 'refresh-chamber-inventory'...",
        );/
        window.dispatchEvent(new Event("refresh-chamber-inventory"));
      } catch (error) {
        console.error("❌ Error persistiendo cambios del lote:", error);
      } finally {
        setIsSaving(false);
      }
    } else {
      /*console.log(
        "ℹ️ [BatchDetail] Salida sin cambios (isDirty === false). Omitiendo guardado redundante.",
      );/
    }

    // Ejecutamos la navegación hacia atrás de forma segura
    console.log(
      "%c=== 🏁 FIN PROCESO SALIDA -> NAVEGANDO A HOME ===",
      "background: #222; color: #ff0055",
    );/
    onBack();
  };}*/

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
        <h2 className={styles.sectionSubtitle}>
          Entradas de Lote Activas —{" "}
          {state.product.alternativeDescription || state.product.description}
        </h2>

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
                    state.product!.unitsPerCrate,
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
