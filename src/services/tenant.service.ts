// src/services/tenant.service.ts
import {
  type LayoutData,
  type OperatorData,
} from "../components/Layout/LayoutApp.vm";
import { apiClient } from "./apiClient";

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

export const TenantService = {
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
};
