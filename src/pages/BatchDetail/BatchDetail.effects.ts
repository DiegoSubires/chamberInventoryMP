// src/pages/BatchDetail/BatchDetail.effects.ts
import { useEffect } from "react";
import { InventoryService } from "../../services/inventory.service";
import { type Product } from "../../types/product.types";

interface UseBatchDetailEffectsProps {
  productId: string;
  tenantId: string;
  setLoading: (loading: boolean) => void;
  hydrateState: (data: Product) => void;
}

export function useBatchDetailEffects({
  productId,
  tenantId,
  setLoading,
  hydrateState,
}: UseBatchDetailEffectsProps) {
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!productId || !tenantId) return;
      try {
        setLoading(true);

        const fetchedProduct =
          await InventoryService.fetchProductInventoryDetail(
            productId,
            tenantId,
          );

        // 🛡️ AÑADIR ESTE LOG PARA DEPURAR
        console.log("🔍 [Debug] Producto recibido:", fetchedProduct);

        // 🛡️ BLINDAJE: Verificamos que el objeto exista
        if (!fetchedProduct) {
          console.error(
            "❌ El servicio devolvió null para el producto:",
            productId,
          );
          return; // Salimos si no hay datos
        }

        if (isMounted) {
          // 🎯 Mapeo seguro
          const productDetail: Product = {
            id: fetchedProduct.id || "",
            code: fetchedProduct.code || "S/C",
            description: fetchedProduct.description || "Sin descripción",
            alternativeDescription: fetchedProduct.alternativeDescription || "",
            category: fetchedProduct.category || "SIN CATEGORIA",
            unitsPerCrate: fetchedProduct.unitsPerCrate || 0,
            batches: Array.isArray(fetchedProduct.batches)
              ? fetchedProduct.batches
              : [],
          };

          hydrateState(productDetail);
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
  }, [productId, tenantId, setLoading, hydrateState]);
}
