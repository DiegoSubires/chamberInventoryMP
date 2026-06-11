// src/services/inventory.service.ts
import { type Product } from "../pages/Home/Home.vm";
import { type BatchLine } from "../components/BatchRow/BatchRow.vm";
import { apiClient } from "./apiClient";
import { type HomeProduct } from "../pages/Home/Home.vm";

interface RawProductWithCounts {
  _id?: string;
  id?: string;
  code?: string;
  description?: string;
  alternativeDescription?: string;
  category?: string;
  subcategory?: string;
  unitsPerCrate?: number;
  visible?: boolean;
  sortOrder?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  batches?: any[];
  totalCrates?: number;
  totalUnits?: number;
}

export interface BackendBatchLine {
  batch: string;
  quantity: number;
  crates: number;
  looseUnits: number;
  packingDate?: string;
  elapsedDays: number;
}

// 1. Definimos el contrato (Debe coincidir con HomeSummarySchema de Zod)

export interface HomeSummaryResponse {
  tenantId: string;
  date: string;
  summary: HomeProduct[];
}

export const InventoryService = {
  /**
   * Obtiene el resumen consolidado para el Home
   */
  async fetchInventorySummary(
    tenantId: string,
    date: string,
  ): Promise<HomeProduct[]> {
    try {
      const endpoint = `/api/inventory/summary?tenantId=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(date)}`;

      const data = await apiClient(endpoint);

      return (data.summary || data) as HomeProduct[];
    } catch (error) {
      console.error("💥 Error al obtener el resumen consolidado:", error);
      throw error;
    }
  },
  /**
   * 1. Carga el catálogo blindando cualquier respuesta inesperada del servidor
   */
  async fetchCatalogWithActiveCounts(
    tenantId: string,
    workingDate: string,
  ): Promise<Product[]> {
    if (!tenantId || !workingDate) return [];

    const endpoint = `/api/inventory/products-with-counts?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;

    try {
      // Reemplazamos fetch por tu apiClient (el control res.ok ya va dentro)
      const data: RawProductWithCounts[] = await apiClient(endpoint);

      if (!Array.isArray(data)) {
        console.warn(
          "⚠️ [InventoryService] La respuesta del backend no es un array válido.",
        );
        return [];
      }

      return data.map((prod) => {
        // 🛡️ Tu blindaje interno de lotes intacto
        const rawBatches = Array.isArray(prod.batches) ? prod.batches : [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeBatches: BatchLine[] = rawBatches.map((b: any) => ({
          id: b.id || Math.random().toString(36).substr(2, 9),
          batchCode: b.batch || b.batchCode || "",
          totalUnits: Number(b.quantity ?? b.totalUnits ?? 0),
          crates: Number(b.crates ?? 0),
          looseUnits: Number(b.looseUnits ?? 0),
          packingDate: b.packingDate || "",
          elapsedDays: Number(b.elapsedDays ?? 0),
        }));

        return {
          id: prod.id || prod._id || "",
          code: prod.code || "S/C",
          description: prod.description || "Sin descripción",
          alternativeDescription: prod.alternativeDescription || "",
          category: prod.category || "SIN CATEGORIA",
          subcategory: prod.subcategory || "",
          unitsPerCrate: Number(prod.unitsPerCrate || 0),
          visible: prod.visible !== undefined ? prod.visible : true,
          sortOrder: Number(prod.sortOrder || 0),
          batches: safeBatches,
          totalCrates: Number(prod.totalCrates || 0),
          totalUnits: Number(prod.totalUnits || 0),
        };
      });
    } catch (error) {
      console.error(
        "🚨 [InventoryService] Fallo crítico recuperando catálogo:",
        error,
      );
      return [];
    }
  },

  /**
   * 2. Guarda el borrador parseando datos a tipos primitivos nativos
   */
  async saveProductBatches(
    tenantId: string,
    productId: string,
    workingDate: string,
    batches: BatchLine[],
  ): Promise<void> {
    //const url = `http://localhost:4000/api/inventory/temporary`;
    const endpoint = `/api/inventory/temporary`;

    // 🛡️ SEGUNDA BARRERA: Forzar conversión numérica explícita antes de enviar el JSON
    const formattedLines: BackendBatchLine[] = (batches || []).map((b) => ({
      batch: String(b.batchCode || ""),
      quantity: Number(b.totalUnits || 0),
      crates: Number(b.crates || 0),
      looseUnits: Number(b.looseUnits || 0),
      packingDate: b.packingDate,
      elapsedDays: Number(b.elapsedDays || 0),
    }));

    /*const payloadString = JSON.stringify({
      tenantId,
      productId,
      countDate: workingDate,
      batchLines: formattedLines,
    });

    /*console.log(
      "📤 [InventoryService SAVE] Payload JSON que sale hacia la API:",
      JSON.stringify(payloadString, null, 2),
    );//

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payloadString,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ [InventoryService SAVE] Error en la API remota:",
        errorText,
      );
      throw new Error(`Error en persistencia temporal: ${errorText}`);
    }
    /*console.log(
      "📥 [InventoryService SAVE] Respuesta OK del Servidor (PUT temporal exitoso).",
    );*/

    await apiClient(endpoint, {
      method: "PUT",
      body: JSON.stringify({
        tenantId,
        productId,
        countDate: workingDate,
        batchLines: formattedLines,
      }),
    });
  },

  /**
   * Envía el inventario definitivo al servidor para su consolidación y archivo.
   * Soporta re-envíos en caso de que se corrijan errores.
   */
  async saveFinalizedInventory(
    tenantId: string,
    workingDate: string,
    operatorName: string,
    productsList: Product[],
  ): Promise<void> {
    //const url = `http://localhost:4000/api/inventory/finalize`;
    const endpoint = `/api/inventory/finalize`;

    /*console.log(
      `🔒 [InventoryService] Enviando GUARDADO DEFINITIVO para el día ${workingDate} (Operario: ${operatorName})`,
    );*/

    const formattedProducts = productsList.map((prod) => {
      // Mapeamos los lotes limpiando las propiedades de bandejas que no queremos heredar
      const formattedBatches = (prod.batches || []).map((b) => ({
        batchCode: String(b.batchCode || ""),
        totalUnits: Number(b.totalUnits || 0),
        packingDate: b.packingDate, // 📅 Ya viene del flujo temporal
        elapsedDays: Number(b.elapsedDays || 0),
      }));

      return {
        productId: prod.id,
        code: prod.code,
        alternativeDescription: prod.alternativeDescription || prod.description,
        sortOrder: Number(prod.sortOrder || 0), // 📋 Copia de seguridad del orden actual del Excel
        totalUnits: Number(prod.totalUnits || 0),
        batches: formattedBatches,
      };
    });

    /*console.log(
      `🔒 [InventoryService] Solicitando GUARDADO DEFINITIVO para el día ${workingDate}. (Operario: ${operatorName})`,
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tenantId,
        countDate: workingDate,
        operator: operatorName,
        products: formattedProducts,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "❌ [InventoryService] Fallo en el guardado definitivo:",
        errorText,
      );
      throw new Error(
        `Error al consolidar el inventario definitivo: ${errorText}`,
      );
    }

    console.log(
      "✅ [InventoryService] Registro guardado con éxito en mp_ch_finalized_inventories.",
    );*/
    await apiClient(endpoint, {
      method: "POST",
      body: JSON.stringify({
        tenantId,
        countDate: workingDate,
        operator: operatorName,
        products: formattedProducts,
      }),
    });
  },

  /**
   * 3. Envía la orden de cierre definitivo para consolidar el histórico del día
   */
  async finalizeDay(
    tenantId: string,
    workingDate: string,
    operatorName: string,
  ): Promise<{ success: boolean; message: string }> {
    //const url = `http://localhost:4000/api/inventory/finalize`;
    const endpoint = `/api/inventory/finalize`;

    /*const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        countDate: workingDate,
        operatorName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Fallo crítico al finalizar el recuento.");
    }

    return data;*/
    return apiClient(endpoint, {
      method: "POST",
      body: JSON.stringify({
        tenantId,
        countDate: workingDate,
        operatorName,
      }),
    });
  },

  /**
   * Verifica si una jornada ya está cerrada de forma definitiva
   */
  async checkDayStatus(
    tenantId: string,
    workingDate: string,
  ): Promise<boolean> {
    try {
      const endpoint = `/api/inventory/day-status?tenantId=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;
      const data = await apiClient(endpoint);
      return !!data.finalized;
    } catch {
      return false;
    }
  },

  /**
   * Retorna la URL directa de descarga física del archivo
   */
  getExportUrl(tenantId: string, workingDate: string): string {
    return `${import.meta.env.VITE_API_URL}/api/inventory/export-excel?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;
  },

  /**
   * Obtiene el detalle de un producto dentro del contexto de inventario
   */
  async fetchProductInventoryDetail(
    productId: string,
    tenantId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Al ser un detalle de inventario, usamos la ruta de productos pero centralizada aquí
    const endpoint = `/api/products/${productId}?tenant=${encodeURIComponent(tenantId)}`;
    return await apiClient(endpoint);
  },
};
