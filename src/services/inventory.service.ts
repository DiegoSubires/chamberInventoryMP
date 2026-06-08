// src/services/inventory.service.ts
import { type Product } from "../pages/Home/Home.vm";
import { type BatchLine } from "../components/BatchRow/BatchRow.vm";
import { apiClient } from "./apiClient";

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

// 1. EXTRAEMOS LA LÓGICA DE MAPEADO (El "Blindaje" frente a cambios en los productos o datos corruptos )
const mapRawToDomain = (prod: RawProductWithCounts): Product => {
  console.log(
    `[Service.prod.batches] Mapeando producto: ${prod.id || prod._id}, Lotes crudos:`,
    prod.batches,
  );

  const rawBatches = Array.isArray(prod.batches) ? prod.batches : [];
  console.log(
    `[Service.rawBatches] Mapeando producto: ${prod.id || prod._id}, Lotes crudos:`,
    rawBatches,
  );

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

  const mapped = {
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

  console.log(
    `[Service.mapped] Producto final mapeado: ${mapped.id}, Total Unidades: ${mapped.totalUnits}`,
  );

  return mapped;
};

/*export const InventoryService = {
  /**
   * 1. Carga el catálogo cruzado usando la ruta oficial del enrutador /api/inventory
   /
  async fetchCatalogWithActiveCounts(
    tenantId: string,
    workingDate: string,
  ): Promise<Product[]> {
    if (!tenantId || !workingDate) return [];

    // 🎯 URL Corregida: añadimos /inventory para que coincida con el router index del backend
    const url = `http://localhost:4000/api/inventory/products-with-counts?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;

    console.log(`🌐 [InventoryService] Solicitando catálogo a: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [InventoryService] Error en catálogo:", errorText);
      throw new Error(
        `Error del servidor catálogo: ${response.status} - ${errorText}`,
      );
    }

    const data: RawProductWithCounts[] = await response.json();

    return data.map((prod) => ({
      id: prod.id || prod._id || "",
      code: prod.code || "S/C",
      description: prod.description || "Sin descripción",
      alternativeDescription: prod.alternativeDescription || "",
      category: prod.category || "SIN CATEGORIA",
      subcategory: prod.subcategory || "",
      unitsPerCrate: prod.unitsPerCrate || 0,
      visible: prod.visible !== undefined ? prod.visible : true,
      sortOrder: prod.sortOrder || 0,
      batches: prod.batches || [],
      totalCrates: prod.totalCrates || 0,
      totalUnits: prod.totalUnits || 0,
    }));
  },

  /**
   * 2. Guarda el borrador temporal usando el método PUT permitido en app.js
   /
  async saveProductBatches(
    tenantId: string,
    productId: string,
    workingDate: string,
    batches: BatchLine[], // Recibe las líneas del estado de React
  ): Promise<void> {
    const url = `http://localhost:4000/api/inventory/temporary`;

    // 🟢 MAPEO DE SEGURIDAD: Transformamos el estado de React al contrato del Backend
    const formattedLines: BackendBatchLine[] = batches.map((b) => ({
      batch: b.batchCode || "", // Convertimos batchCode a batch
      quantity: b.totalUnits || 0,
      crates: b.crates || 0,
      looseUnits: b.looseUnits || 0,
      packingDate: b.packingDate,
      elapsedDays: b.elapsedDays || 0,
    }));

    const payloadString = JSON.stringify({
      tenantId,
      productId,
      countDate: workingDate,
      batchLines: formattedLines,
    });

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payloadString,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en persistencia temporal: ${errorText}`);
    }
  },
};*/

export const InventoryService = {
  /**
   * 1a. Carga todo el catálogo blindando cualquier respuesta inesperada del servidor (para Home)
   */
  async fetchCatalogWithActiveCounts(
    tenantId: string,
    workingDate: string,
  ): Promise<Product[]> {
    const endpoint = `/api/inventory/products-with-counts?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;
    const data: RawProductWithCounts[] = await apiClient(endpoint);
    console.log(
      `[Service.fetchCatalogWithActiveCounts] Respuesta Home (API):`,
      data,
    );
    return Array.isArray(data) ? data.map(mapRawToDomain) : [];
  },

  /**
   * 1a. Carga solo un producto del catálogo, blindando cualquier respuesta inesperada del servidor (para BatchDetail)
   */
  async fetchProductWithInventoryCounts(
    productId: string,
    tenantId: string,
    workingDate: string,
  ): Promise<Product | null> {
    // Si tu backend tiene un endpoint de detalle, úsalo aquí.
    // Si NO tiene, puedes filtrar el endpoint de catálogo, PERO el backend debería soportar /products-with-counts/${productId}
    const endpoint = `/api/inventory/products-with-counts/${productId}?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;

    try {
      const data: RawProductWithCounts = await apiClient(endpoint);
      return mapRawToDomain(data);
    } catch (e) {
      console.error("Error al obtener detalle del producto:", e);
      return null;
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
    /*try {
      const url = `http://localhost:4000/api/inventory/day-status?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;
      //const endpoint = `/api/inventory/day-status?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;
      const response = await fetch(url);
      if (!response.ok) return false;
      const data = await response.json();
      return !!data.finalized;
    } catch {
      return false;
    }*/
    try {
      const endpoint = `/api/inventory/day-status?tenant=${encodeURIComponent(tenantId)}&date=${encodeURIComponent(workingDate)}`;
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
  ): Promise<Product | null> {
    // ⚠️ ATENCIÓN AQUÍ: Asegúrate de pasar la fecha si el backend la necesita
    const workingDate = localStorage.getItem("chamber_inventory_working_date");
    const url = `/api/inventory/products/${productId}?tenant=${tenantId}&date=${workingDate}`;
    const data = await apiClient(url);
    console.log(`[Service] Respuesta Detail (API):`, data); // 🔍 LOG 4
    return data ? mapRawToDomain(data) : null;
  },
};
