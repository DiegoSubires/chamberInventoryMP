// src/components/AppRouter/AppRouter.tsx
//import { HashRouter } from "react-router-dom";
import { Home } from "../../pages/Home/Home";
import BatchDetail from "../../pages/BatchDetail/BatchDetail";
import { type UserSession } from "../../types/auth.types";
import { type FilterState } from "../../types/filter.types";
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
  filters: { activeCategory: string | null; activeSubcategory: string | null };
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export type ScreenView = "CATALOG" | "BATCH_DETAIL";

export function AppRouter({
  userSession,
  currentScreen,
  selectedProductId,
  onNavigate,
  onRegisterFinalizeAction,
  onRegisterSaveAction,
  filters,
  setFilters,
}: AppRouterProps) {
  //console.log("🟡 [AppRouter.tsx] Filtros recibidos:", filters);

  return (
    <div className={styles.routerWrapper}>
      {currentScreen === "CATALOG" ? (
        <Home
          userSession={userSession}
          tenantId={userSession.tenantId}
          onNavigate={onNavigate}
          onRegisterFinalizeAction={onRegisterFinalizeAction}
          filters={filters}
          setFilters={setFilters}
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
