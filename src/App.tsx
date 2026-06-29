// src/App.tsx
import { useState } from "react";
import { LayoutApp } from "./components";
import { type HeaderAction } from "./components/Layout/LayoutApp.vm";
import { AppRouter, type ScreenView } from "./components/AppRouter/AppRouter";
import { type UserSession } from "./types/auth.types";
import { type FilterState } from "./types/filter.types";

/*onst getCookie = (name: string): string => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
};*/

const URLS = {
  HUB: "https://diegosubires.github.io/tracesync-hub/",
  MICROAPP: "https://diegosubires.github.io/chamberInventoryMP/",
};

export default function App() {
  //console.log("🚀 [App.tsx] Renderizando App principal...");

  const [session] = useState<UserSession>(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const encodedUser = urlParams.get("u");
    const encodedTenant = urlParams.get("t");

    let userName = "Operario no identificado";
    let tenantId = "moreno_plaza";
    let isIdentified = false;

    try {
      if (encodedUser) {
        userName = decodeURIComponent(atob(encodedUser));
        isIdentified = true;
      }
      if (encodedTenant) {
        tenantId = decodeURIComponent(atob(encodedTenant));
      }
    } catch (e) {
      console.error("Error decodificando parámetros de sesión:", e);
    }

    return {
      name: userName,
      section: "Recuento de Cámaras",
      tenantId: tenantId,
      isIdentified: isIdentified,
    };
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenView>("CATALOG");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [finalizeInventoryFn, setFinalizeInventoryFn] = useState<
    (() => Promise<void>) | null
  >(null);
  const [saveBatchLinesFn, setSaveBatchLinesFn] = useState<
    (() => Promise<void>) | null
  >(null);
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);

  const [filterState, setFilterState] = useState<FilterState>({
    activeCategory: "Frescos Granel", // o null
    activeSubcategory: null as string | null,
  });

  const handleLogout = () => {
    window.location.replace(URLS.HUB);
  };

  const handleNavigate = (
    screen: ScreenView,
    productId: string | null = null,
  ) => {
    setSelectedProductId(productId);
    setCurrentScreen(screen);
  };

  /*const handleFinalizeClick = async () => {
    if (finalizeInventoryFn) {
      await finalizeInventoryFn();
    }
  };*/

  const handleSaveAndBackClick = async () => {
    if (saveBatchLinesFn) {
      await saveBatchLinesFn();
    }
    handleNavigate("CATALOG", null);
  };

  // 🎛️ 5. Generador Dinámico de Botones para la Cabecera
  const renderHeaderActions = (): HeaderAction[] => {
    switch (currentScreen) {
      case "CATALOG":
        return [
          {
            // 💡 Si el día está cerrado, cambia el texto mágicamente
            label: isDayClosed
              ? "📥 Descargar Reporte Excel"
              : "🔒 Fin de recuento",
            onClick: () => {
              if (finalizeInventoryFn) finalizeInventoryFn();
            },
            // Opcional: puedes pasarle un className diferente si tienes estilos para descargas
          },
        ];

      case "BATCH_DETAIL":
        return [
          {
            label: "⬅️ Guardar y Volver",
            onClick: handleSaveAndBackClick,
          },
        ];

      default:
        return [];
    }
  };

  //console.log("🟢 [App.tsx] Estado actual de filtros:", filterState);

  return (
    <LayoutApp
      tenantId={session.tenantId}
      operatorName={session.name}
      microappName={session.section}
      operatorRole="Operario"
      onLogout={handleLogout}
      onExitApp={handleLogout}
      actions={renderHeaderActions()}
    >
      <AppRouter
        userSession={session}
        currentScreen={currentScreen}
        selectedProductId={selectedProductId}
        onNavigate={handleNavigate}
        // Registramos los punteros que las vistas rellenarán con sus respectivas lógicas de guardado
        onRegisterFinalizeAction={(fn, isClosed) => {
          setFinalizeInventoryFn(() => fn);
          setIsDayClosed(isClosed);
        }}
        onRegisterSaveAction={(fn) => {
          setSaveBatchLinesFn(() => fn);
        }}
        filters={filterState}
        setFilters={setFilterState}
      />
    </LayoutApp>
  );
}
