// src/pages/Home/Home.effects.ts
import { useEffect } from "react";
import { InventoryService } from "../../services/inventory.service";
//import { ProductService } from "../../services/product.service";
import { type Product } from "../../types/product.types";

export const useHomeEffects = (
  tenantId: string,
  workingDate: string,
  setLoading: (l: boolean) => void,
  setProducts: (p: Product[]) => void,
) => {
  useEffect(() => {
    if (!tenantId || !workingDate) {
      /*console.log(
        "⏳ [Home.effects] Esperando parámetros maestros (tenantId o workingDate)...",
      );*/
      return;
    }

    let mounted = true;

    const loadCatalogAndCounts = async () => {
      setLoading(true);
      try {
        const consolidatedProducts =
          await InventoryService.fetchInventorySummary(tenantId, workingDate);

        if (mounted) {
          setProducts(consolidatedProducts);
        }
      } catch (err) {
        console.error("❌ [Home.effects] Error al cargar inventario:", err);
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
  }, [tenantId, workingDate, setLoading, setProducts]);
};
