// src/components/CategoryFilter/CategoryFilter.tsx
import styles from "./CategoryFilter.module.scss";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelect,
}) => {
  return (
    <div className={styles.filterContainer}>
      {categories.map((cat) => (
        <button
          type="button"
          key={cat}
          className={`${styles.tabBtn} ${activeCategory === cat ? styles.tabActive : ""}`}
          onClick={() => onSelect(cat)}
        >
          {cat.replace("Frescos ", "").toUpperCase()}
        </button>
      ))}
    </div>
  );
};
