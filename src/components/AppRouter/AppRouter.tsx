// src/components/AppRouter/AppRouter.tsx
//import { HashRouter } from "react-router-dom";
import { Home } from "../../pages/Home/Home";
import BatchDetail from "../../pages/BatchDetail/BatchDetail";
import { type UserSession } from "../../types/auth.types";
import styles from "./AppRouter.module.scss";

interface AppRouterProps {
  userSession: UserSession;
  currentScreen: ScreenView;
  selectedProductId: string | null;
  onNavigate: (screen: ScreenView, productId: string | null) => void;
  onRegisterFinalizeAction: (
    fn: () => Promise<void>,
    isClosed: boolean,
  ) => void;
  onRegisterSaveAction: (fn: () => Promise<void>) => void;
}

export type ScreenView = "CATALOG" | "BATCH_DETAIL";

export function AppRouter({
  userSession,
  currentScreen,
  selectedProductId,
  onNavigate,
  onRegisterFinalizeAction,
  onRegisterSaveAction,
}: AppRouterProps) {
  /*const [currentScreen, setCurrentScreen] = useState<ScreenView>("CATALOG");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const handleNavigate = (
    screen: ScreenView,
    productId: string | null = null,
  ) => {
    setSelectedProductId(productId);
    setCurrentScreen(screen);
  };*/

  /*const renderScreen = () => {
    switch (currentScreen) {
      case "CATALOG":
        return (
          <Home
            userSession={userSession}
            onNavigate={onNavigate}
            onRegisterFinalizeAction={onRegisterFinalizeAction}
          />
        );

      case "BATCH_DETAIL":
        if (!selectedProductId) return <div>No product selected.</div>;
        return (
          <BatchDetail
            productId={selectedProductId}
            tenantId={userSession.tenantId}
            onBack={() => onNavigate("CATALOG", null)}
            onRegisterSaveAction={onRegisterSaveAction}
          />
        );

      default:
        return <div>Ruta no encontrada en la planta.</div>;
    }
  };

  return <div className={styles.routerWrapper}>{renderScreen()}</div>;*/

  return (
    <div className={styles.routerWrapper}>
      {currentScreen === "CATALOG" ? (
        <Home
          userSession={userSession}
          onNavigate={onNavigate}
          onRegisterFinalizeAction={onRegisterFinalizeAction}
        />
      ) : (
        <BatchDetail
          productId={selectedProductId || ""}
          tenantId={userSession.tenantId}
          onBack={() => onNavigate("CATALOG", null)}
          onRegisterSaveAction={onRegisterSaveAction}
        />
      )}
    </div>
  );
}
