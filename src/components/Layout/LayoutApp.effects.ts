// src/components/LayoutApp/LayoutApp.effects.ts
import { useEffect } from "react";
import { TenantService } from "../../services/tenant.service";
import { type LayoutState } from "./LayoutApp.vm";

export const useLayoutEffects = (
  tenantId: string,
  operatorId: string,
  setState: React.Dispatch<React.SetStateAction<LayoutState>>,
) => {
  useEffect(() => {
    const load = async () => {
      /*console.log(
        `🎬 [useLayoutEffects] Iniciando efecto de carga para [Tenant: ${tenantId}] y [Operario: ${operatorId}]`,
      );*/
      try {
        const data = await TenantService.getLayoutInfo(tenantId, operatorId);
        /*console.log(
          "✅ [useLayoutEffects] Datos unificados devueltos por el servicio con éxito:",
          data,
        );*/

        setState({
          config: data.config,
          operator: data.operator,
          loading: false,
        });
      } catch (err) {
        console.error(
          "💥 [useLayoutEffects] ERROR detectado y atrapado en el catch:",
          err,
        );
        setState((prev) => {
          console.log(
            "⚠️ [useLayoutEffects] Congelando estado previo debido al fallo:",
            prev,
          );
          return { ...prev, loading: false };
        });
      }
    };

    if (tenantId) {
      load();
    } else {
      console.warn(
        "⚠️ [useLayoutEffects] No se ejecuta la carga porque 'tenantId' está vacío o undefined.",
      );
    }
  }, [tenantId, operatorId, setState]);
};
