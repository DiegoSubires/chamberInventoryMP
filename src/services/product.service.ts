// src/services/product.service.ts
import { type Product } from "../pages/Home/Home.vm";
import { type BatchLine } from "../components/BatchRow/BatchRow.vm";
import { apiClient } from "./apiClient";

// Tipamos lo que ESPERAMOS recibir del backend
interface RawProduct {
  _id?: string;
  id?: string;
  code?: string;
  description?: string;
  alternativeDescription?: string;
  category?: string;
  subcategory?: string;
  unitsPerCrate?: number;
  batches?: BatchLine[];
}

//console.log("⚙️ [ProductService] Servicio inicializado y listo para usarse.");

export const ProductService = {
  // 1. Obtener catálogo completo (Para Home)
  async fetchAllProducts(tenantId: string): Promise<Product[]> {
    //const url = `http://localhost:4000/api/products?tenant=${tenantId}`;
    const endpoint = `/api/products?tenant=${tenantId}`;

    //const response = await fetch(url);

    const data: RawProduct[] = await apiClient(endpoint);

    /*if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [API] Error en respuesta:", errorText);
      throw new Error(`Error ${response.status}`);
    }

    const data: RawProduct[] = await response.json();*/

    // Mapper seguro
    return data.map((prod: RawProduct) => ({
      id: prod.id || prod._id || "",
      code: prod.code || "S/C",
      description: prod.description || "Sin descripción",
      alternativeDescription: prod.alternativeDescription || "",
      category: prod.category || "SIN CATEGORIA",
      subcategory: prod.subcategory || "",
      unitsPerCrate: prod.unitsPerCrate || 0,
      batches: prod.batches || [],
    }));
  },

  // 2. Obtener producto individual (Para BatchDetail)
  async fetchProductById(
    productId: string,
    tenantId: string,
  ): Promise<Product> {
    // 💡 AÑADIDO: ?tenant=${tenantId}
    //const url = `http://localhost:4000/api/products/${productId}?tenant=${tenantId}`;
    const endpoint = `/api/products/${productId}?tenant=${tenantId}`;

    /*const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `❌ [API] Error buscando producto ${productId}:`,
        response.statusText,
      );
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: RawProduct = await response.json();*/

    const data: RawProduct = await apiClient(endpoint);

    return {
      id: data.id || data._id || "",
      code: data.code || "S/C",
      description: data.description || "Sin descripción",
      alternativeDescription: data.alternativeDescription || "",
      category: data.category || "SIN CATEGORIA",
      subcategory: data.subcategory || "",
      unitsPerCrate: data.unitsPerCrate || 0,
      batches: data.batches || [],
    };
  },
};
