// src/services/product.service.ts
import { type Product } from "../pages/Home/Home.vm";
import { type BatchLine } from "../components/BatchRow/BatchRow.vm";
import { apiClient } from "./apiClient";

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

export const ProductService = {
  /*async fetchAllProducts(tenantId: string): Promise<Product[]> {
    const endpoint = `/api/products?tenant=${tenantId}`;
    const data: RawProduct[] = await apiClient(endpoint);

    return data.map((prod) => ({
      id: prod.id || prod._id || "",
      code: prod.code || "S/C",
      description: prod.description || "Sin descripción",
      alternativeDescription: prod.alternativeDescription || "",
      category: prod.category || "SIN CATEGORIA",
      subcategory: prod.subcategory || "",
      unitsPerCrate: prod.unitsPerCrate || 0,
      batches: prod.batches || [],
    }));
  },*/
  async fetchAllProducts(tenantId: string): Promise<Product[]> {
    const endpoint = `/api/products/home-catalog?tenantId=${encodeURIComponent(tenantId)}`;

    const data = await apiClient(endpoint);

    console.log("📥 [FRONTEND-PRODUCTS] Home Products recibido:", data);

    if (!Array.isArray(data)) {
      console.warn(
        "⚠️ [ProductService] El catálogo recibido no es un array válido.",
      );
      return [];
    }

    return data as Product[];
  },

  async fetchProductById(
    productId: string,
    tenantId: string,
  ): Promise<Product> {
    const endpoint = `/api/products/${productId}?tenant=${tenantId}`;
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
