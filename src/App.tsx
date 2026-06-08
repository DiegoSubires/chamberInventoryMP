/*/ src/App.tsx
import { useState } from "react";
import { LayoutApp } from "./components";
import { AppRouter } from "./components/AppRouter/AppRouter";
import { type UserSession } from "./types/auth.types";

const getCookie = (name: string): string => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
};

export default function App() {
  const [session] = useState<UserSession>(() => {
    const user = getCookie("auth_operator");
    //const section = getCookie("section");
    const tenant = getCookie("auth_tenant");

    //console.log("🍪 Cookies obtenidas - User:", user, "Tenant:", tenant);

    if (user) {
      return {
        name: user,
        section: "Recuento de Cámaras",
        tenantId: tenant || "Sin Empresa",
        isIdentified: true,
      };
    }

    return {
      name: "Operario no identificado",
      section: "Recuento de Cámaras",
      tenantId: "moreno_plaza",
      isIdentified: false,
    };
  });

  const handleLogout = () => {
    const hubUrl =
      window.location.hostname === "localhost"
        ? "http://localhost:5174/"
        : "https://tracesync.github.io/hub/";

    window.location.replace(hubUrl);
  };

  return (
    <LayoutApp
      tenantId={session.tenantId}
      operatorName={session.name}
      onLogout={handleLogout}
    >
      <AppRouter userSession={session} />
    </LayoutApp>
  );
}*/

// src/App.tsx
import { useState } from "react";
import { LayoutApp } from "./components";
import { type HeaderAction } from "./components/Layout/LayoutApp.vm";
import { AppRouter, type ScreenView } from "./components/AppRouter/AppRouter";
import { type UserSession } from "./types/auth.types";

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

  // 🔍 LOG 2: Verificar qué datos se le inyectan finalmente al LayoutApp
  //console.log("🏗️ [App.tsx] Renderizando LayoutApp con sesión:", session);

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
      />
    </LayoutApp>
  );
}
