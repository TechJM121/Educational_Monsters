export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  requiresAuth: boolean;
  title: string;
  breadcrumb?: string;
  icon?: string;
}

export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  requiresAuth: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive: boolean;
}

export interface PageTransition {
  initial: object;
  animate: object;
  exit: object;
  transition: object;
}