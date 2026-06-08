import { type BatchLine } from "../../components/BatchRow";

export interface Product {
  id: string;
  code: string;
  description: string;
  alternativeDescription: string;
  category: string;
  subcategory?: string;
  unitsPerCrate: number;
  totalCrates?: number;
  batches?: BatchLine[];
  sortOrder?: number;
  totalUnits?: number;
  visible?: boolean;
}

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
