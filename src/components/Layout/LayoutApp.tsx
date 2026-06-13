// src/components/Layout/LayoutApp.tsx
import React from "react";
import styles from "./Layoutapp.module.scss";
import { type ExtendedLayoutProps } from "./LayoutApp.vm";
import { useLayoutState } from "./LayoutApp.state";
import { useLayoutEffects } from "./LayoutApp.effects";

export const LayoutApp: React.FC<ExtendedLayoutProps> = ({
  children,
  tenantId,
  operatorName,
  operatorRole = "Operario",
  microappName,
  onLogout,
  actions = [],
}) => {
  const [state, setState] = useLayoutState();

  useLayoutEffects(tenantId, setState);

  //if (state.loading || !state.config) return <div>Cargando...</div>;
  if (state.loading) {
    return (
      <div className={styles.loadingWrapper}>
        Cargando entorno corporativo...
      </div>
    );
  }

  if (!state.config) {
    console.error(
      "❌ [LayoutApp.tsx] La configuración del tenant no pudo cargarse en el layout.",
    );
    return (
      <div>Error crítico al inicializar los datos maestros del Tenant.</div>
    );
  }

  return (
    <div className={styles.portalWrapper}>
      <header className={styles.headerBar}>
        <div className={styles.headerContainer}>
          {/* Sección Izquierda: Identidad Visual de la Empresa */}
          <div className={styles.leftSection}>
            {state.config.logoUrl && (
              <img
                src={state.config.logoUrl} // Inyección directa del formato Base64 de la BD
                alt="Logo Corporativo"
                className={styles.logoImage}
              />
            )}
            <div className={styles.brandMeta}>
              {/* Estructura limpia de base de datos sin duplicar campos */}
              <span className={styles.companyName}>
                {state.config.businessName || "TraceSync"}
              </span>
              <span className={styles.pageLabel}>
                {microappName || state.config.microappName}
              </span>
            </div>
          </div>

          {/* Sección Derecha: Metadatos del operario que audita la planta */}
          <div className={styles.rightSection}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{operatorName}</span>
              <span className={styles.userRole}>{operatorRole}</span>
            </div>

            <div className={styles.dynamicActionsContainer}>
              {actions.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={act.onClick}
                  disabled={act.disabled}
                  className={act.className || styles.logoutButton}
                >
                  {act.label}
                </button>
              ))}
            </div>

            <div className={styles.actionsContainer}>
              {/* {onExitApp && (
                <button
                  type="button"
                  onClick={onExitApp}
                  className={styles.logoutButton}
                >
                  Volver al Hub
                </button>
              )}*/}
              <button
                type="button"
                onClick={onLogout}
                className={styles.logoutButton}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Área de Trabajo de las Vistas del Enrutador */}
      <main className={styles.mainContent}>{children}</main>

      <footer className={styles.footerBar}>
        <div className={styles.footerContent}>
          <p>{state.config.businessName}</p>
          <p>{state.config.companyAddress}</p>
        </div>
      </footer>
    </div>
  );
};
