// src/pages/BatchDetail/BatchDetail.effects.ts
import { useEffect } from "react";
import { InventoryService } from "../../services/inventory.service";
import { type Product } from "../../types/product.types";

interface UseBatchDetailEffectsProps {
  productId: string;
  tenantId: string;
  workingDate: string;
  setLoading: (loading: boolean) => void;
  hydrateState: (data: Product) => void;
}

export function useBatchDetailEffects({
  productId,
  tenantId,
  workingDate,
  setLoading,
  hydrateState,
}: UseBatchDetailEffectsProps) {
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      // Validamos que tengamos los tres parámetros necesarios
      if (!productId || !tenantId || !workingDate) return;

      try {
        setLoading(true);

        // 🚀 USAMOS LA NUEVA FUNCIÓN DEL SERVICIO
        const fetchedProduct =
          await InventoryService.fetchProductWithActiveCountsById(
            tenantId,
            productId,
            workingDate,
          );

        console.log("🔍 [Debug] Producto recibido:", fetchedProduct);

        if (!fetchedProduct) {
          console.error(
            "❌ El servicio devolvió null para el producto:",
            productId,
          );
          return;
        }

        if (isMounted) {
          const productToHydrate = {
            ...fetchedProduct,
            // Asegúrate de mapear las propiedades si el nombre difiere
            // Ejemplo: Si el estado espera 'batches' y recibes 'batchLines', debes renombrar:
            batches: fetchedProduct.batchLines || [],
          };

          console.log(
            "🔍 [2. Datos pasando a hydrateState]:",
            productToHydrate,
          );
          hydrateState(productToHydrate as Product);
        }
      } catch (error) {
        console.error(
          "❌ [BatchDetail.effects] Error crítico al cargar:",
          error,
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [productId, tenantId, workingDate, setLoading, hydrateState]);
}
