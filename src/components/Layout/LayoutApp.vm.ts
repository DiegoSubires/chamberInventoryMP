// src/components/Layout/LayoutApp.vm.ts
export interface LayoutData {
  logoUrl: string;
  businessName: string;
  microappName: string;
  operatorAvatarUrl: string;
  companyAddress: string;
}

export interface LayoutProps {
  children?: React.ReactNode;
  tenantId: string;
  operatorName: string;
  operatorRole?: string;
  microappName?: string;
  onLogout?: () => void;
  onExitApp?: () => void;
}

export interface HeaderAction {
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export interface ExtendedLayoutProps extends LayoutProps {
  children: React.ReactNode;
  actions?: HeaderAction[];
}

export interface OperatorData {
  fullName: string;
  avatarUrl: string;
}

export interface LayoutState {
  config: LayoutData | null;
  loading: boolean;
}
