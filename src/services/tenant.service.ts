// src/services/tenant.service.ts
import {
  type LayoutData,
  type OperatorData,
} from "../components/Layout/LayoutApp.vm";
import { apiClient } from "./apiClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapApiToLayoutData = (data: any): LayoutData => {
  /*console.log(
    "🗺️ [TenantService - Mapper] Datos crudos que entran al mapeador:",
    data,
  );*/

  const mapped: LayoutData = {
    logoUrl: data.logo_url || data.logoUrl || "/default-logo.png",
    businessName:
      data.nombre_empresa || data.businessName || "Empresa Sin Nombre",
    microappName: data.app_name || "App",
    operatorAvatarUrl: "",
    companyAddress: data.direccion || data.companyAddress || "Sin dirección",
  };

  /*console.log(
    "🗺️ [TenantService - Mapper] Resultado final tras el mapeo:",
    mapped,
  );*/
  return mapped;
};

export const TenantService = {
  async getLayoutInfo(tenantId: string, operatorId: string) {
    //const tenantUrl = `http://localhost:4000/api/tenant-config/${tenantId}`;
    //const operatorUrl = `http://localhost:4000/api/operator/${encodeURIComponent(operatorId)}`;
    const tenantEndpoint = `/api/tenant-config/${tenantId}`;
    const operatorEndpoint = `/api/operator/${encodeURIComponent(operatorId)}`;

    /*console.log(
      `🚀 [TenantService] Ejecutando llamadas en paralelo:\n  👉 ${tenantUrl}\n  👉 ${operatorUrl}`,
    );*/

    /*const [configRes, opRes] = await Promise.all([
      fetch(tenantUrl),
      fetch(operatorUrl),
    ]);*/

    const [configRaw, operatorRaw] = await Promise.all([
      apiClient(tenantEndpoint),
      apiClient(operatorEndpoint).catch(() => {
        /* Replicamos tu bloque else: objeto por defecto si falla la petición */
        return { fullName: operatorId || "Invitado", avatarUrl: "" };
      }),
    ]);

    return {
      config: mapApiToLayoutData(configRaw),
      operator: operatorRaw as OperatorData,
    };

    /*console.log(
      `📊 [TenantService] Respuestas HTTP de red recibidas -> Config Status: ${configRes.status} | Operator Status: ${opRes.status}`,
    );*/

    /*if (!configRes.ok) {
      const errorText = await configRes.text();
      console.error(
        `❌ [TenantService] Error en la respuesta del Tenant. Body de error: ${errorText}`,
      );
      throw new Error(
        `No se pudo cargar la configuración del tenant. Status: ${configRes.status}`,
      );
    }

    const configRaw = await configRes.json();
    /*console.log(
      "📦 [TenantService] JSON decodificado del Tenant con éxito:",
      configRaw,
    );//

    let operatorRaw;
    if (opRes.ok) {
      operatorRaw = await opRes.json();
      /*console.log(
        "📦 [TenantService] JSON decodificado del Operario con éxito:",
        operatorRaw,
      );//
    } else {
      /*console.warn(
        `⚠️ [TenantService] La petición del operario falló (${opRes.status}). Aplicando objeto por defecto.`,
      );//
      operatorRaw = { fullName: operatorId || "Invitado", avatarUrl: "" };
    }

    return {
      config: mapApiToLayoutData(configRaw),
      operator: operatorRaw as OperatorData,
    };*/
  },
};
