/*import React from "react";
import styles from "./ProductCard.module.scss";

interface BatchLine {
  id: string;
  batchCode: string;
  packingDate: string;
  elapsedDays: number;
  crates: number;
  looseUnits: number;
  totalUnits: number;
}

interface Product {
  id: string;
  code: string;
  description: string;
  alternativeDescription: string;
  category: string;
  unitsPerCrate: number;
  batches?: BatchLine[];
}

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
  const granTotalBandejas =
    product.batches?.reduce((acc, linea) => acc + (linea.totalUnits || 0), 0) ||
    0;

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
          {/* 🎯 Añadido el badge informativo en la tarjeta /}
        </div>

        <div className={styles.totalBadge}>
          <strong>{granTotalBandejas} unds</strong>
        </div>
      </div>
    </div>
  );
};*/

import React from "react";
import styles from "./ProductCard.module.scss";

interface BatchLine {
  id: string;
  batchCode: string;
  packingDate: string;
  elapsedDays: number;
  crates: number;
  looseUnits: number;
  totalUnits: number;
}

interface Product {
  id: string;
  code: string;
  description: string;
  alternativeDescription: string;
  category: string;
  unitsPerCrate: number;
  batches?: BatchLine[];
  totalCrates?: number;
  totalUnits?: number;
}

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
  /*const bjsTotales = product.totalCrates || 0;
  const undsTotales = product.totalUnits || 0;
  const uPorCaja = product.unitsPerCrate || 0;*/
  //const totalCalculado = undsTotales + bjsTotales * uPorCaja;
  const totalCalculado =
    product.batches?.reduce((acc, b) => acc + (b.totalUnits || 0), 0) || 0;
  /*const totalDesdeArrayBatches =
    product.batches?.reduce((acc, b) => acc + (b.totalUnits || 0), 0) || 0;

  console.log(
    `🃏 [ProductCard RENDER] -> [${product.code}] - ${product.description}`,
  );
  console.log(
    `   └─> totalUnits (BD): ${undsTotales} | totalCrates (BD): ${bjsTotales} | unitsPerCrate: ${uPorCaja}`,
  );
  console.log(
    `   └─> 🛑 Operación Matemática Final: ${undsTotales} + (${bjsTotales} * ${uPorCaja}) = ${totalCalculado} unds`,
  );
  console.log(
    `   └─> 💡 Plan B (Suma de array batches local): ${totalDesdeArrayBatches} unds (Tiene ${product.batches?.length || 0} lotes asignados)`,
  );*/

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
          <strong>{totalCalculado} unds</strong>
        </div>
      </div>
    </div>
  );
};
