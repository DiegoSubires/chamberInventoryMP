import React from "react";
import styles from "./ProductCard.module.scss";
import { type Product } from "../../types/product.types";

interface ProductCardProps {
  product: Product;
  isLandscape: boolean;
  onNavigate: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isLandscape,
  onNavigate,
}) => {
  return (
    <div
      className={`${styles.card} ${isLandscape ? styles.landscapeCard : ""}`}
      onClick={() => onNavigate(product.id)}
      role="button"
      tabIndex={0}
    >
      <div className={styles.summaryHeader}>
        <div className={styles.descBlock}>
          <span className={styles.alternativeText}>
            {product.alternativeDescription || product.description}
          </span>
        </div>

        <div className={styles.totalBadge}>
          <strong>{product.totalQuantity} unds</strong>
        </div>
      </div>
    </div>
  );
};
