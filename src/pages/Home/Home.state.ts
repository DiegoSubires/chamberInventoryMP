// src/pages/Home/Home.state.ts
import { useMemo, useState } from "react";
import { initialHomeState, type HomeState } from "./Home.vm";
import { type FilterState } from "../../types/filter.types";

/*export const useHomeViewModel = (
  state: HomeState,
  setState: React.Dispatch<React.SetStateAction<HomeState>>,
) => {
  // 1. Extraer las subcategorías ÚNICAS basándonos en la categoría activa
  const availableSubcategories = useMemo(() => {
    if (!state.products) return [];

    const productsByCat = state.products.filter(
      (p) => p.category === state.activeCategory,
    );

    // Filtramos nulos, indefinidos o textos vacíos
    const subLista = productsByCat
      .map((p) => p.subcategory)
      .filter((sub): sub is string => !!sub && sub.trim() !== "");

    // Evitamos duplicados con un Set
    return Array.from(new Set(subLista));
  }, [state.products, state.activeCategory]);

  // 2. Filtrado combinado (Categoría Principal + Subcategoría opcional)
  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      const matchesCategory =
        state.activeCategory === "TODOS" || p.category === state.activeCategory;

      const matchesSubcategory =
        !state.activeSubcategory || p.subcategory === state.activeSubcategory;

      return matchesCategory && matchesSubcategory;
    });
  }, [state.products, state.activeCategory, state.activeSubcategory]);

  // 3. Acción para cambiar categoría principal (Resetea la subcategoría anterior)
  const setActiveCategory = (category: string) => {
    setState((prev) => ({
      ...prev,
      activeCategory: category,
      activeSubcategory: "", // 🔄 Limpieza automática al cambiar de pestaña
    }));
  };

  // 4. Acción para cambiar subcategoría
  const setActiveSubcategory = (subcategory: string) => {
    setState((prev) => ({ ...prev, activeSubcategory: subcategory }));
  };

  return {
    filteredProducts,
    availableSubcategories, // Se expone al componente para renderizar los botones
    setActiveCategory,
    setActiveSubcategory,
    activeSubcategory: state.activeSubcategory,
    loading: state.loading,
  };
};

export const useHomeState = () => {
  return useState<HomeState>(initialHomeState);
};*/

export const useHomeViewModel = (
  state: HomeState,
  filters: FilterState,
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>,
) => {
  // 1. Extraer subcategorías ÚNICAS basadas en la categoría del PROP (filters)
  const availableSubcategories = useMemo(() => {
    if (!state.products) return [];

    const productsByCat = state.products.filter(
      (p) => p.category === filters.activeCategory,
    );

    const subLista = productsByCat
      .map((p) => p.subcategory)
      .filter((sub): sub is string => !!sub && sub.trim() !== "");

    return Array.from(new Set(subLista));
  }, [state.products, filters.activeCategory]);

  // 2. Filtrado combinado (Categoría + Subcategoría de los PROPS)
  const filteredProducts = useMemo(() => {
    return state.products.filter((p) => {
      const matchesCategory =
        filters.activeCategory === "TODOS" ||
        p.category === filters.activeCategory;

      const matchesSubcategory =
        !filters.activeSubcategory ||
        p.subcategory === filters.activeSubcategory;

      return matchesCategory && matchesSubcategory;
    });
  }, [state.products, filters.activeCategory, filters.activeSubcategory]);

  // 3. Acciones que usan el setFilters del padre (App.tsx)
  const setActiveCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      activeCategory: category,
      activeSubcategory: null, // Reset al cambiar categoría
    }));
  };

  const setActiveSubCategory = (subcategory: string) => {
    setFilters((prev) => ({ ...prev, activeSubcategory: subcategory }));
  };

  /*const setActiveCategory = (cat: string) => {
    console.log("🔵 [Home.state.ts] Intentando cambiar categoría a:", cat);
    setFilters((prev: FilterState) => {
      const newState = {
        ...prev,
        activeCategory: cat,
        activeSubcategory: null,
      };
      console.log("🔵 [Home.state.ts] Nuevo estado calculado:", newState);
      return newState;
    });
  };

  const setActiveSubCategory = (subcat: string) => {
    console.log(
      "🔵 [Home.state.ts] Intentando cambiar subcategoría a:",
      subcat,
    );
    setFilters((prev: FilterState) => {
      const newState = {
        ...prev,
        activeSubcategory: subcat,
      };
      console.log("🔵 [Home.state.ts] Nuevo estado calculado:", newState);
      return newState;
    });
  };*/

  return {
    filteredProducts,
    availableSubcategories,
    setActiveCategory,
    setActiveSubCategory,
    activeSubcategory: filters.activeSubcategory,
    activeCategory: filters.activeCategory,
    loading: state.loading,
  };
};

export const useHomeState = () => {
  return useState<HomeState>(initialHomeState);
};
