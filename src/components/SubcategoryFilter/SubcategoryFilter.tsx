// src/components/SubcategoryFilter/SubcategoryFilter.tsx
import React from "react";
import styles from "./SubcategoryFilter.module.scss";

interface SubcategoryFilterProps {
  subcategories: string[];
  activeSubcategory: string;
  onSelect: (subcategory: string) => void;
}

export const SubcategoryFilter: React.FC<SubcategoryFilterProps> = ({
  subcategories,
  activeSubcategory,
  onSelect,
}) => {
  return (
    <div className={styles.subFilterContainer}>
      {/* Botón comodín para ver todo el contenido de la categoría seleccionada */}
      <button
        type="button"
        className={`${styles.subTabBtn} ${styles.allTab} ${activeSubcategory === "" ? styles.tabActive : ""}`}
        onClick={() => onSelect("")}
      >
        TODAS
      </button>

      {subcategories.map((sub, index) => {
        // Rotamos entre 5 clases de colores diferentes según el índice
        const colorClass = styles[`color${(index % 5) + 1}`];
        const isActive = activeSubcategory === sub;

        return (
          <button
            type="button"
            key={sub}
            className={`${styles.subTabBtn} ${colorClass} ${isActive ? styles.tabActive : ""}`}
            onClick={() => onSelect(sub)}
          >
            {sub.trim().toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
