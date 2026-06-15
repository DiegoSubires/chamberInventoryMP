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
  return (
    <div className={styles.routerWrapper}>
      {currentScreen === "CATALOG" ? (
        <Home
          userSession={userSession}
          tenantId={userSession.tenantId}
          onNavigate={onNavigate}
          onRegisterFinalizeAction={onRegisterFinalizeAction}
        />
      ) : (
        <BatchDetail
          productId={selectedProductId || ""}
          tenantId={userSession.tenantId}
          operatorName={userSession.name}
          onBack={() => onNavigate("CATALOG", null)}
          onRegisterSaveAction={onRegisterSaveAction}
        />
      )}
    </div>
  );
}
