// src/services/tenant.service.ts
import {
  type LayoutData,
  //type OperatorData,
} from "../components/Layout/LayoutApp.vm";
import { apiClient } from "./apiClient";

export interface TenantConfig {
  tenantId: string;
  businessName: string;
  companyAddress: string;
  logoUrl: string;
  nombre_empresa: string;
  direccion: string;
  logo_url: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapApiToLayoutData = (data: any): LayoutData => {
  return {
    logoUrl: data.logo_url || data.logoUrl || "/default-logo.png",
    businessName:
      data.nombre_empresa || data.businessName || "Empresa Sin Nombre",
    microappName: data.app_name || "App",
    operatorAvatarUrl: "",
    companyAddress: data.direccion || data.companyAddress || "Sin dirección",
  };
};

/*export const TenantService = {
  async getLayoutInfo(tenantId: string, operatorId: string) {
    const tenantEndpoint = `/api/tenant-config/${tenantId}`;
    const operatorEndpoint = `/api/operator/${encodeURIComponent(operatorId)}`;

    const [configRaw, operatorRaw] = await Promise.all([
      apiClient(tenantEndpoint).catch(() => ({
        logo_url: "",
        nombre_empresa: "Error cargando",
        app_name: "App",
      })),
      apiClient(operatorEndpoint).catch(() => ({
        fullName: operatorId || "Invitado",
        avatarUrl: "",
      })),
    ]);

    return {
      config: mapApiToLayoutData(configRaw),
      operator: operatorRaw as OperatorData,
    };
  },
};*/

export const TenantService = {
  // 1. Servicio específico para obtener datos puros del API
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    const endpoint = `/api/tenant-config/${encodeURIComponent(tenantId)}`;
    try {
      const data = await apiClient(endpoint);
      return data as TenantConfig;
    } catch (error) {
      console.error(
        `🚨 Error al obtener config del tenant ${tenantId}:`,
        error,
      );
      throw error;
    }
  },

  // 2. Servicio de orquestación para el Layout
  async getLayoutInfo(tenantId: string) {
    // 1. Solo traemos la configuración del tenant desde el API
    const configRaw = await this.getTenantConfig(tenantId).catch(() => ({
      logo_url: "",
      logoUrl: "",
      nombre_empresa: "Error cargando",
      businessName: "Error cargando",
      app_name: "App",
      direccion: "",
      companyAddress: "",
    }));

    return {
      config: mapApiToLayoutData(configRaw),
    };
  },
};
