/*/ src/pages/BatchDetail/BatchDetail.effects.ts
import { useEffect } from "react";
import { ProductService } from "../../services/product.service";
import { type ProductDetail } from "./BatchDetail.vm";

//console.log("🧠 [BatchDetail.effects] Hook definido.");

interface UseBatchDetailEffectsProps {
  productId: string;
  tenantId: string;
  setLoading: (loading: boolean) => void;
  hydrateState: (data: ProductDetail) => void;
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
        const fetchedProduct = await ProductService.fetchProductById(
          productId,
          tenantId,
        );

        if (fetchedProduct && isMounted) {
          // ✅ SOLUCIÓN TYPESCRIPT: Aseguramos que 'batches' es un array explícito para satisfacer a ProductDetail
          const safeProductDetail: ProductDetail = {
            ...fetchedProduct,
            batches: fetchedProduct.batches || [],
          };

          hydrateState(safeProductDetail);
        }
      } catch (error) {
        console.error(
          "❌ [BatchDetail.effects] Falló la carga asíncrona:",
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
*/

/*/ src/pages/BatchDetail/BatchDetail.effects.ts
import { useEffect } from "react";
import { ProductService } from "../../services/product.service";
import { type ProductDetail } from "./BatchDetail.vm";
import { type BatchLine } from "../../components/BatchRow/BatchRow.vm";
import { type BackendBatchLine } from "../../services/inventory.service";

// Interface para tipar lo que nos responde de forma exacta el pipeline de agregación del backend
interface AggregatedProductCatalogItem {
  id: string;
  code?: string;
  description?: string;
  category?: string;
  batches: BackendBatchLine[]; // 🎯 Usamos el contrato estricto del backend
}

interface UseBatchDetailEffectsProps {
  productId: string;
  tenantId: string;
  setLoading: (loading: boolean) => void;
  hydrateState: (data: ProductDetail) => void;
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

        const workingDate =
          localStorage.getItem("chamber_inventory_working_date") ||
          new Date().toISOString().split("T")[0];

        // 1. Traemos el cascarón estático del producto original
        const fetchedProduct = await ProductService.fetchProductById(
          productId,
          tenantId,
        );

        // 2. Solicitamos el catálogo de hoy enriquecido por la agregación
        const response = await fetch(
          `http://localhost:4000/api/inventory/products-with-counts?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`,
        );

        // 🎯 Tipamos la respuesta como un array de items agregados
        const activeCatalog: AggregatedProductCatalogItem[] =
          await response.json();

        // Buscamos nuestro producto utilizando tipado estricto
        const currentProductWithCounts = activeCatalog.find(
          (p: AggregatedProductCatalogItem) => p.id === productId,
        );

        if (fetchedProduct && isMounted) {
          const backendBatches: BackendBatchLine[] =
            currentProductWithCounts?.batches || [];

          // Mapeamos de BackendBatchLine (contrato base de datos) a BatchLine (estado de React)
          const mappedLinesForReact: BatchLine[] = backendBatches.map(
            (b: BackendBatchLine, idx: number) => ({
              id: `${productId}-batch-${idx}`, // ID único para el key de React
              batchCode: b.batch, // 'batch' de Mongo se mapea a 'batchCode'
              packingDate:
                b.packingDate || new Date().toISOString().split("T")[0],
              elapsedDays: b.elapsedDays || 0,
              crates: b.crates || 0,
              looseUnits: b.looseUnits || 0,
              totalUnits: b.quantity || 0, // 'quantity' de Mongo se mapea a 'totalUnits'
            }),
          );

          const safeProductDetail: ProductDetail = {
            ...fetchedProduct,
            batches: mappedLinesForReact, // Hidratamos el estado con tipado idéntico
          };

          hydrateState(safeProductDetail);
        }
      } catch (error) {
        console.error(
          "❌ [BatchDetail.effects] Falló la carga asíncrona tipada:",
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
  }, [productId, tenantId, hydrateState, setLoading]);
}*/

// src/pages/BatchDetail/BatchDetail.effects.ts
import { useEffect } from "react";
import { InventoryService } from "../../services/inventory.service";
import { type Product } from "../Home/Home.vm";

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

        // El servicio ya nos devuelve el objeto listo y sanitizado
        const fetchedProduct =
          await InventoryService.fetchProductInventoryDetail(
            productId,
            tenantId,
          );

        console.log(
          `[Effect] Producto recibido en BatchDetail:`,
          fetchedProduct,
        );

        if (fetchedProduct && isMounted) {
          // Ya no hace falta mapear nada aquí, el servicio lo hizo
          hydrateState(fetchedProduct);
        }
      } catch (error) {
        console.error(
          "❌ [BatchDetail.effects] Error al cargar detalle:",
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
