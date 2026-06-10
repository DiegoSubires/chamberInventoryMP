// src/pages/Home/Home.effects.ts
import { useEffect } from "react";
import { InventoryService } from "../../services/inventory.service";
import { ProductService } from "../../services/product.service";
import { type Product } from "./Home.vm";

export const useHomeEffects = (
  tenantId: string,
  workingDate: string,
  setLoading: (l: boolean) => void,
  setProducts: (p: Product[]) => void,
) => {
  useEffect(() => {
    // 🛡️ Guardián de ejecución: Si falta el tenant o la fecha de trabajo, no disparamos la red
    if (!tenantId || !workingDate) {
      /*console.log(
        "⏳ [Home.effects] Esperando parámetros maestros (tenantId o workingDate)...",
      );*/
      return;
    }

    let mounted = true;

    /*const loadCatalogAndCounts = async () => {
      /*console.log(
        `🔄 [Home.effects] Ejecutando carga en cascada -> Planta: ${tenantId} | Día: ${workingDate}`,
      );//

      setLoading(true);

      try {
        // Solicitamos el catálogo cruzado con los borradores o lotes activos del día
        const mergedData = await InventoryService.fetchCatalogWithActiveCounts(
          tenantId,
          workingDate,
        );
        //console.log("📊 Lotes crudos en Home:", mergedData[0]?.batches);

        if (mounted) {
          setProducts(mergedData);
          /*console.log(
            `📊 [Home.effects] Catálogo sincronizado con éxito. (${mergedData.length} artículos cargados)`,
          );//
        }
      } catch (err) {
        console.error(
          "❌ [Home.effects] Error crítico solicitando mapeo de inventario diario:",
          err,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };*/
    const loadCatalogAndCounts = async () => {
      setLoading(true);
      try {
        // 1. Ejecutamos ambas peticiones en paralelo para mayor velocidad
        const [allProducts, summaryData] = await Promise.all([
          ProductService.fetchAllProducts(tenantId),
          InventoryService.fetchInventorySummary(tenantId, workingDate),
        ]);

        // 2. Creamos el diccionario (Map) leyendo el array anidado 'summary'
        // Usamos un fallback con '?? []' para blindar la app si viniera vacío de la BD
        const summaryMap = new Map(
          (summaryData?.summary ?? []).map((s) => [
            s.productId,
            s.totalQuantity,
          ]),
        );

        // 3. Fusionamos los datos y rellenamos con 0 si no existe
        const mergedData: Product[] = allProducts.map((prod) => ({
          ...prod,
          totalQuantity: summaryMap.get(prod.id) ?? 0,
        }));

        console.log(mergedData);

        if (mounted) {
          setProducts(mergedData);
        }
      } catch (err) {
        console.error(
          "❌ [Home.effects] Error fusionando catálogo y resumen:",
          err,
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCatalogAndCounts();

    const handleRefreshSignal = () => {
      console.log(
        "🔄 [Home.effects] Señal de refresco capturada. Actualizando inventario...",
      );
      loadCatalogAndCounts();
    };

    window.addEventListener("refresh-chamber-inventory", handleRefreshSignal);

    // Limpieza del efecto si el componente se desmonta o cambian las dependencias
    return () => {
      mounted = false;
      window.removeEventListener(
        "refresh-chamber-inventory",
        handleRefreshSignal,
      );
    };

    // ✅ IMPORTANTE: Añadimos workingDate aquí.
    // Si el usuario cambia de día en la pantalla, este array reactiva el flujo entero de red.
  }, [tenantId, workingDate, setLoading, setProducts]);
};
