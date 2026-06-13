// src/components/Layout/LayoutApp.effects.ts
import { useEffect } from "react";
import { TenantService } from "../../services/tenant.service";
import { type LayoutState, type LayoutData } from "./LayoutApp.vm";

export const useLayoutEffects = (
  tenantId: string,
  operatorName: string,
  setState: React.Dispatch<React.SetStateAction<LayoutState>>,
) => {
  useEffect(() => {
    const load = async () => {
      try {
        const config = await TenantService.getTenantConfig(tenantId);

        // Mapeamos TenantConfig -> LayoutData aquí
        const mappedConfig: LayoutData = {
          logoUrl: config.logo_url || config.logoUrl || "/default-logo.png",
          businessName:
            config.nombre_empresa || config.businessName || "Empresa",
          microappName: "Recuento de Cámaras", // O el valor que corresponda
          operatorAvatarUrl: "", // Este campo no viene del tenant, se deja vacío o se gestiona
          companyAddress:
            config.direccion || config.companyAddress || "Sin dirección",
        };

        setState({
          config: mappedConfig,
          operator: {
            fullName: operatorName,
            avatarUrl: "",
            role: "Operario",
          },
          loading: false,
        });
      } catch (err) {
        setState((prev) => ({ ...prev, loading: false }));
        console.log(err);
      }
    };

    if (tenantId) load();
  }, [tenantId, operatorName, setState]);
};
