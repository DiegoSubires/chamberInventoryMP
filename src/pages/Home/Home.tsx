// src/pages/Home/Home.tsx
import React, { useState, useCallback, useEffect } from "react";
import { ProductCard } from "../../components/ProductCard/ProductCard";
import { CategoryFilter } from "../../components/CategoryFilter/CategoryFilter";
import { SubcategoryFilter } from "../../components/SubcategoryFilter/SubcategoryFilter";
import { useHomeState, useHomeViewModel } from "./Home.state";
import { useHomeEffects } from "./Home.effects";
import { type ScreenView } from "../../components/AppRouter/AppRouter";
import { InventoryService } from "../../services/inventory.service";
import styles from "./Home.module.scss";
import { type Product } from "../../types/product.types";
import { type FilterState } from "../../types/filter.types";

interface HomeProps {
  userSession: {
    tenantId: string;
    name: string;
  };
  tenantId: string;
  onNavigate: (screen: ScreenView, productId: string | null) => void;
  //onRegisterFinalizeAction: (fn: () => Promise<void>) => void;
  onRegisterFinalizeAction: (
    fn: () => Promise<void>,
    isClosed: boolean,
  ) => void;
  filters: { activeCategory: string | null; activeSubcategory: string | null };
  //setFilters: (f: FilterState) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const Home: React.FC<HomeProps> = ({
  userSession,
  tenantId,
  onNavigate,
  onRegisterFinalizeAction,
  filters,
  setFilters,
}) => {
  console.log("🔴 [Home.tsx] Filtros recibidos:", filters);

  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight,
  );
  const [state, setState] = useHomeState();
  const [isDayClosed, setIsDayClosed] = useState<boolean>(false);

  // 📅 1. Captura y persistencia de la fecha de trabajo en Planta
  const [workingDate, setWorkingDate] = useState<string>(() => {
    const saved = localStorage.getItem("chamber_inventory_working_date");
    // Si no hay fecha guardada, por defecto ponemos la fecha actual del sistema (YYYY-MM-DD)
    return saved || new Date().toISOString().split("T")[0];
  });

  // Funciones auxiliares para actualizar el estado global de carga y productos
  const setLoading = useCallback(
    (loading: boolean) => {
      setState((prev) => ({ ...prev, loading }));
    },
    [setState],
  );

  const setProducts = useCallback(
    (products: Product[]) => {
      setState((prev) => ({ ...prev, products }));
    },
    [setState],
  );

  const {
    filteredProducts,
    availableSubcategories,
    /*activeSubcategory,
    setActiveCategory,
    setActiveSubcategory,*/
    loading,
  } = useHomeViewModel(state, setState);

  /*const setActiveCategory = (cat: string) => {
    setFilters({ activeCategory: cat, activeSubcategory: null });
  };

  const setActiveSubcategory = (sub: string) => {
    setFilters({ ...filters, activeSubcategory: sub });
  };*/

  // 🔄 2. Inyección del Hook de Efectos (Escucha cambios de Planta y de Fecha)
  useHomeEffects(userSession.tenantId, workingDate, setLoading, setProducts);

  useEffect(() => {
    const handleResize = () =>
      setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      const closed = await InventoryService.checkDayStatus(
        userSession.tenantId,
        workingDate,
      );
      if (active) {
        setIsDayClosed(closed);
      }
    };
    checkStatus();
    return () => {
      active = false;
    };
  }, [workingDate, userSession.tenantId]);

  /*console.log(
    `🏠 [Home Render] loading: ${loading} | Cantidad de productos en catálogo: ${filteredProducts.length}`,
  );
  if (filteredProducts.length > 0) {
    console.log(
      "📋 [Home Render] Listado actual de productos filtrados:",
      filteredProducts,
    );
  }*/

  // 📆 3. Manejador del cambio de fecha en el input tipo calendario
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    /*console.log(
      `📅 [Home.tsx] Cambiando fecha de trabajo de la planta a: ${newDate}`,
    );*/
    setWorkingDate(newDate);
    localStorage.setItem("chamber_inventory_working_date", newDate);
  };

  /*const handleFinalizeInventory = useCallback(async () => {
    try {
      console.log(
        `🔒 [Home.tsx] Cerrando recuento del día ${workingDate}. Responsable: ${userSession.name}`,
      );
      // 🚀 AQUÍ DISPARARÁS TU SERVICIO DE CIERRE HACIA EL BACKEND EN EL FUTURO:
      // await InventoryService.finalizeDay(userSession.tenantId, workingDate, userSession.name);
      alert(
        `Recuento del día ${workingDate} finalizado y auditado correctamente.`,
      );
    } catch (error) {
      console.error("Error al finalizar el inventario:", error);
    }
  }, [workingDate, userSession.name]);*/

  /*const handleFinalizeInventory = useCallback(async () => {
    const confirmClose = window.confirm(
      `⚠️ ¿Estás SEGURO de que deseas CERRAR definitivamente el recuento del día ${workingDate}?\n\nEsta acción archivará los lotes en el histórico inmutable y vaciará los borradores de trabajo.`,
    );

    if (!confirmClose) return;

    try {
      setLoading(true); // Congela la interfaz para evitar interacciones táctiles mientras procesa Atlas

      const result = await InventoryService.finalizeDay(
        userSession.tenantId,
        workingDate,
        userSession.name,
      );

      alert(`✅ ${result.message || "Jornada consolidada con éxito."}`);

      // Refrescamos la ventana limpia para vaciar la vista tras vaciar el borrador
      window.location.reload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(
        `🚨 Error al finalizar jornada:\n${error.message || "No se pudo conectar con el servidor."}`,
      );
    } finally {
      setLoading(false);
    }
  }, [workingDate, userSession.tenantId, userSession.name, setLoading]);*/

  // 1. Definimos la función usando 'state.products' que viene de useHomeState
  const handleFinalizeInventory = useCallback(async () => {
    const confirmClose = window.confirm(
      `⚠️ ¿Estás SEGURO de que deseas CERRAR definitivamente el recuento del día ${workingDate}?`,
    );

    if (!confirmClose) return;

    try {
      setLoading(true);

      // Llamamos al servicio solo con los datos básicos
      await InventoryService.finalizeInventory(
        tenantId, // Asegúrate de tener este tenantId disponible
        workingDate,
        userSession.name,
      );

      alert("✅ Jornada finalizada y datos consolidados.");
      window.location.reload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error en finalización:", error);
      alert(`🚨 Error al finalizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [tenantId, workingDate, userSession.name, setLoading]);

  /*useEffect(() => {
    onRegisterFinalizeAction(handleFinalizeInventory);
  }, [handleFinalizeInventory, onRegisterFinalizeAction]);*/

  // Acción de Descarga Directa
  /*const handleDownloadExcel = useCallback(async () => {
    const downloadUrl = InventoryService.getExportUrl(
      userSession.tenantId,
      workingDate,
    );
    // Dispara la descarga transparente en el navegador/Electron
    window.location.href = downloadUrl;
  }, [workingDate, userSession.tenantId]);*/

  const handleDownloadExcel = useCallback(async () => {
    try {
      setLoading(true); // Opcional: muestra un spinner mientras se genera el archivo
      await InventoryService.downloadExcel(userSession.tenantId, workingDate);
    } catch (error) {
      console.error("Error en descarga:", error);
      alert("🚨 Error al descargar el archivo Excel.");
    } finally {
      setLoading(false);
    }
  }, [workingDate, userSession.tenantId, setLoading]);

  // 🎯 Notifica y suscribe dinámicamente el botón global del Layout según el estado del día
  useEffect(() => {
    if (isDayClosed) {
      onRegisterFinalizeAction(handleDownloadExcel, true);
    } else {
      onRegisterFinalizeAction(handleFinalizeInventory, false);
    }
  }, [
    isDayClosed,
    handleFinalizeInventory,
    handleDownloadExcel,
    onRegisterFinalizeAction,
  ]);

  const setActiveCategory = (cat: string) => {
    console.log("🔵 [Home.tsx] Intentando cambiar categoría a:", cat);
    setFilters((prev: FilterState) => {
      const newState = {
        ...prev,
        activeCategory: cat,
        activeSubcategory: null, // Al cambiar de categoría, reseteamos la subcategoría
      };
      console.log("🔵 [Home.tsx] Nuevo estado calculado:", newState);
      return newState;
    });
  };

  const setActiveSubCategory = (subcat: string) => {
    console.log("🔵 [Home.tsx] Intentando cambiar subcategoría a:", subcat);
    setFilters((prev: FilterState) => {
      const newState = {
        ...prev,
        // ¡IMPORTANTE! No pongas activeCategory: null
        // Al usar ...prev, ya mantenemos la categoría actual
        activeSubcategory: subcat,
      };
      console.log("🔵 [Home.tsx] Nuevo estado calculado:", newState);
      return newState;
    });
  };

  return (
    <div className={styles.homeContainer}>
      {/* Barra de Herramientas Superior: Ahora solo conserva el selector de fecha */}
      <div className={styles.topControlBar}>
        <div className={styles.dateSelectorSection}>
          <label htmlFor="workingDateInput">Fecha de Trabajo en Planta:</label>
          <input
            id="workingDateInput"
            type="date"
            className={styles.dateInput}
            value={workingDate}
            onChange={handleDateChange}
          />
        </div>
        {/* 💡 El botón antiguo de 'Fin de recuento' se ha eliminado de aquí porque ya está arriba en el Layout */}
      </div>

      {/* Catálogo Maestro Dinámico */}
      <div className={styles.mainCatalogContent}>
        <CategoryFilter
          activeCategory={filters.activeCategory || ""}
          onSelect={setActiveCategory}
          categories={["Frescos Granel", "Frescos Pequeña"]}
          //activeCategory={state.activeCategory}
          //onSelect={setActiveCategory}
        />

        {availableSubcategories.length > 0 && (
          <SubcategoryFilter
            subcategories={availableSubcategories}
            activeSubcategory={filters.activeSubcategory || ""}
            onSelect={setActiveSubCategory}
            //activeSubcategory={activeSubcategory || ""}
            //onSelect={setActiveSubcategory}
          />
        )}

        {loading ? (
          <div className={styles.loadingCatalog}>
            Sincronizando lotes con las cámaras...
          </div>
        ) : (
          <div className={styles.productsContainer}>
            {filteredProducts.length === 0 ? (
              <p className={styles.emptyCatalog}>
                No se localizaron artículos cargados para el día {workingDate}.
              </p>
            ) : (
              filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={(id) => onNavigate("BATCH_DETAIL", id)}
                  isLandscape={isLandscape}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
