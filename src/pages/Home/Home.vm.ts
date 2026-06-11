import { type Product } from "../../types/product.types";

export interface HomeState {
  activeCategory: string;
  activeSubcategory: string;
  loading: boolean;
  products: Product[];
  session: {
    name: string;
    section: string;
    tenantId: string;
  };
}

export const initialHomeState: HomeState = {
  activeCategory: "Frescos Granel",
  activeSubcategory: "",
  loading: true,
  products: [],
  session: {
    name: "Operario",
    section: "Materia Prima",
    tenantId: "moreno_plaza",
  },
};

export interface UserSession {
  name: string;
  section: string;
  tenantId: string;
  isIdentified: boolean;
}

export interface HomeProps {
  userSession: UserSession;
  onNavigate: (
    screen: "CATALOG" | "BATCH_DETAIL",
    productId: string | null,
  ) => void;
}
