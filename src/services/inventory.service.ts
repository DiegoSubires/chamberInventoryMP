// src/services/inventory.service.ts
import { apiClient } from "./apiClient";
import { type BatchLine, type Product } from "../types/product.types";

export interface HomeSummaryResponse {
  tenantId: string;
  date: string;
  summary: Product[];
}
export interface SaveTemporaryCountPayload {
  tenantId: string;
  productId: string;
  countDate: string;
  batchLines: BatchLine[];
  operator?: string;
}

export const InventoryService = {
  /**
   * Obtiene el resumen consolidado para el Home
   */
  async fetchInventorySummary(
    tenantId: string,
    date: string,
  ): Promise<Product[]> {
    try {
      const endpoint = `/api/inventory/summary?tenantId=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(date)}`;

      const data = await apiClient(endpoint);

      return (data.summary || data) as Product[];
    } catch (error) {
      console.error("💥 Error al obtener el resumen consolidado:", error);
      throw error;
    }
  },

  /**
   * Obtiene el detalle de un producto específico, incluyendo sus líneas de lote (recuento)
   * para una fecha y tenant determinados.
   */
  /*async fetchProductWithActiveCountsById(
    tenantId: string,
    productId: string,
    workingDate: string,
  ): Promise<Product> {
    // Usamos el endpoint que construimos en tu router (sin la doble barra '//')
    const endpoint = `/api/inventory/product-id?tenantId=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}&id=${encodeURIComponent(productId)}`;

    try {
      const response = await apiClient(endpoint);

      return response.product as Product;
    } catch (error) {
      console.error(
        `🚨 [InventoryService] Error al obtener detalle del producto ${productId}:`,
        error,
      );
      throw error;
    }
  },*/
  async fetchProductWithActiveCountsById(
    tenantId: string,
    productId: string,
    workingDate: string,
  ): Promise<Product> {
    const endpoint = `/api/inventory/product-id?tenantId=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}&id=${encodeURIComponent(productId)}`;

    try {
      const response = await apiClient(endpoint);

      // Si el backend devuelve el objeto product directamente, lo retornamos.
      // Si la respuesta es un 200 pero el producto está vacío, aseguramos la estructura:
      return (response.product || {
        id: productId,
        batchLines: [],
        alternativeDescription: "Nuevo recuento",
      }) as Product;
    } catch (error) {
      console.error(
        `🚨 [InventoryService] Error al obtener detalle del producto ${productId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Guarda el borrador (datos temporales) parseando datos a tipos primitivos nativos
   */
  /*async saveProductBatches(
    tenantId: string,
    productId: string,
    workingDate: string,
    batchLines: BatchLine[],
    operatorName?: string, // Lo recibimos como parámetro opcional
  ): Promise<void> {
    const endpoint = `/api/inventory/temporary`;

    // 1. Mapeo: Ajustamos los nombres al esquema Zod del backend
    const formattedLines = (batchLines || []).map((b) => ({
      batch: String(b.batch || ""),
      quantity: Number(b.quantity || 0),
      crates: Number(b.crates || 0),
      looseUnits: Number(b.looseUnits || 0),
      packingDate: b.packingDate || null,
      elapsedDays: Number(b.elapsedDays || 0),
    }));

    const payload: SaveTemporaryCountPayload = {
      tenantId,
      productId,
      countDate: workingDate,
      batchLines: formattedLines,
      operator: operatorName,
    };

    // 2. Log de auditoría (Front-end)
    console.log(`📝 [Auditoría] Guardando borrador en ${endpoint}:`, {
      timestamp: new Date().toISOString(),
      operator: operatorName,
      productId,
      lineas: formattedLines.length,
    });

    console.log("🚀 [DEBUG InventoryService] Payload a enviar:", {
      endpoint,
      payload,
      stringified: JSON.stringify(payload),
    });

    await apiClient(endpoint, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },*/

  async saveProductBatches(
    tenantId: string,
    productId: string,
    workingDate: string,
    batchLines: BatchLine[],
    operatorName?: string,
  ): Promise<void> {
    const endpoint = `/api/inventory/temporary?tenantId=${encodeURIComponent(tenantId)}`;

    // Limpieza de datos para satisfacer a Zod
    const sanitizedBatchLines = batchLines.map((line) => ({
      ...line,
      batch: line.batch || "",
      quantity: Number(line.quantity),
      crates: Number(line.crates),
      looseUnits: Number(line.looseUnits),
      elapsedDays: Number(line.elapsedDays),
    }));

    // Construcción manual y forzada
    const payload = {
      tenantId,
      productId,
      countDate: workingDate,
      batchLines: sanitizedBatchLines,
      operator: operatorName,
    };

    console.log(
      "🚀 Payload estricto antes de enviar:",
      JSON.stringify(payload),
    );

    return apiClient(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  /**
   * Nuevo servicio para finalizar los recuentos por refactorización del backend en módulos.
   * Unificados saveFinalizedInventory y finalizeDay
   * ¿Soporta re-envíos en caso de que se corrijan errores.?
   */

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
      const formattedBatches = (prod.batchLines || []).map((b) => ({
        batchCode: String(b.batch || ""),
        quantity: Number(b.quantity || 0),
        packingDate: b.packingDate, // 📅 Ya viene del flujo temporal
        elapsedDays: Number(b.elapsedDays || 0),
      }));

      return {
        productId: prod.id,
        code: prod.code,
        alternativeDescription: prod.alternativeDescription || prod.description,
        sortOrder: Number(prod.sortOrder || 0), // 📋 Copia de seguridad del orden actual del Excel
        quantity: Number(prod.quantity || 0),
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

  /*async finalizeInventory(
    tenantId: string,
    workingDate: string,
    operatorName: string,
    productsList: Product[],
  ): Promise<void> {
    const endpoint = `/api/inventory/finalize`;

    // 1. Limpieza y formateo de datos (Preparación del payload)
    const formattedProducts = productsList.map((prod) => ({
      productId: prod.id,
      batchLines: (prod.batchLines || []).map((b) => ({
        batch: String(b.batch || ""),
        quantity: Number(b.quantity || 0),
        crates: Number(b.crates || 0),
        looseUnits: Number(b.looseUnits || 0),
        packingDate: b.packingDate,
        elapsedDays: Number(b.elapsedDays || 0),
      })),
    }));

    // 2. Envío único hacia el endpoint unificado
    await apiClient(endpoint, {
      method: "POST",
      body: JSON.stringify({
        tenantId,
        countDate: workingDate,
        operatorName,
        products: formattedProducts,
        comments: "Finalización desde interfaz", // Puedes añadir un campo de comentarios si lo deseas
      }),
    });

    console.log(
      "✅ [InventoryService] Inventario consolidado y jornada cerrada con éxito.",
    );
  }*/
  async finalizeInventory(
    tenantId: string,
    workingDate: string,
    operatorName: string,
    productsList: Product[],
  ): Promise<void> {
    const endpoint = `/api/inventory/finalize`;

    // LOG 1: Inicio del proceso
    console.log(
      `🛠️ [InventoryService] Preparando consolidación: ${workingDate} | Tenant: ${tenantId}`,
    );

    // 1. Limpieza y formateo
    const formattedProducts = productsList.map((prod) => ({
      productId: prod.id,
      batchLines: (prod.batchLines || []).map((b) => ({
        batch: String(b.batch || ""),
        quantity: Number(b.quantity || 0),
        crates: Number(b.crates || 0),
        looseUnits: Number(b.looseUnits || 0),
        packingDate: b.packingDate,
        elapsedDays: Number(b.elapsedDays || 0),
      })),
    }));

    // LOG 2: Diagnóstico del payload (antes de enviarlo)
    // Esto te permite ver si los datos llegaron "vacíos" o mal formados antes de tocar el backend
    console.log(
      `📦 [InventoryService] Payload generado con ${formattedProducts.length} productos.`,
    );

    try {
      // 2. Envío al backend
      await apiClient(endpoint, {
        method: "POST",
        body: JSON.stringify({
          tenantId,
          countDate: workingDate,
          operatorName,
          products: formattedProducts,
          comments: "Finalización desde interfaz",
        }),
      });

      // LOG 3: Éxito
      console.log(
        "✅ [InventoryService] Respuesta recibida del servidor: Inventario consolidado.",
      );
    } catch (error) {
      // LOG 4: Error específico del frontend (ej. fallo de red o error de API)
      console.error(
        "❌ [InventoryService] Error en la petición POST /finalize:",
        error,
      );
      throw error; // Relanzamos para que el componente Home pueda manejar el alert
    }
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
  /*async fetchProductInventoryDetail(
    productId: string,
    tenantId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Al ser un detalle de inventario, usamos la ruta de productos pero centralizada aquí
    const endpoint = `/api/products/${productId}?tenant=${encodeURIComponent(tenantId)}`;
    return await apiClient(endpoint);
  },*/
};
