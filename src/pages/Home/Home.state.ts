// src/pages/Home/Home.state.ts
import { useMemo, useState } from "react";
import { initialHomeState, type HomeState } from "./Home.vm";

export const useHomeViewModel = (
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
};
