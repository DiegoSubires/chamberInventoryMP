import React from "react";
import styles from "./CategoryBadge.module.scss";

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const normalized = category?.toUpperCase() || "";
  const isGranel = normalized.includes("GRANEL");

  return (
    <span
      className={`${styles.badge} ${isGranel ? styles.granel : styles.pequena}`}
    >
      {isGranel ? "GRANEL" : "PEQUEÑA"}
    </span>
  );
};
