type Endpoint = {
  path: string;
  isAnonymous?: boolean;
};

const API_PREFIX = '/api';

const ENDPOINTS_ROOT = {
  DOCS: '/docs',
  API_DOCS: '/api-docs',
  FAVICON: '/favicon.ico',
  USER: `${API_PREFIX}/users`,
  CATEGORIES: `${API_PREFIX}/categories`,
  PRODUCTS: `${API_PREFIX}/products`,
  LISTS: `${API_PREFIX}/shopping-lists`,
  PANTRIES: `${API_PREFIX}/pantries`,
  PURCHASES: `${API_PREFIX}/purchases`,
};

const DOCS_ENDPOINTS: Endpoint[] = [
  {
    path: ENDPOINTS_ROOT.DOCS,
    isAnonymous: true,
  },
  {
    path: ENDPOINTS_ROOT.API_DOCS,
    isAnonymous: true,
  },
  {
    path: ENDPOINTS_ROOT.FAVICON,
    isAnonymous: true,
  }
];

const USER_ENDPOINTS: Endpoint[] = [
  {
    path: `${ENDPOINTS_ROOT.USER}/register`,
    isAnonymous: true,
  },
  {
    path: `${ENDPOINTS_ROOT.USER}/login`,
    isAnonymous: true,
  },
  { path: `${ENDPOINTS_ROOT.USER}/profile`, },
  {
    path: `${ENDPOINTS_ROOT.USER}/verify-account`,
    isAnonymous: true,
  },
  {
    path: `${ENDPOINTS_ROOT.USER}/forgot-password`,
    isAnonymous: true,
  },
  {
    path: `${ENDPOINTS_ROOT.USER}/reset-password`,
    isAnonymous: true,
  },
  {
    path: `${ENDPOINTS_ROOT.USER}/send-verification`,
    isAnonymous: true,
  },
  { path: `${ENDPOINTS_ROOT.USER}/change-password`, },
  { path: `${ENDPOINTS_ROOT.USER}/logout`, }
];

const CATEGORIES_ENDPOINTS: Endpoint[] = [
  { path: `${ENDPOINTS_ROOT.CATEGORIES}`, },
  { path: `${ENDPOINTS_ROOT.CATEGORIES}/:id` },
];

const PRODUCTS_ENDPOINTS: Endpoint[] = [
  { path: `${ENDPOINTS_ROOT.PRODUCTS}`, },
  { path: `${ENDPOINTS_ROOT.PRODUCTS}/:id` },
];

const LISTS_ENDPOINTS: Endpoint[] = [
  { path: `${ENDPOINTS_ROOT.LISTS}`, },
  { path: `${ENDPOINTS_ROOT.LISTS}/:id` },
];

const PANTRIES_ENDPOINTS: Endpoint[] = [
  { path: `${ENDPOINTS_ROOT.PANTRIES}`, },
  { path: `${ENDPOINTS_ROOT.PANTRIES}/:id` },
];

const PURCHASES_ENDPOINTS: Endpoint[] = [
  { path: `${ENDPOINTS_ROOT.PURCHASES}`, },
  { path: `${ENDPOINTS_ROOT.PURCHASES}/:id` },
];

export const allRoutes: Endpoint[] = [
  ...Object.values(DOCS_ENDPOINTS),
  ...Object.values(USER_ENDPOINTS),
  ...Object.values(CATEGORIES_ENDPOINTS),
  ...Object.values(PRODUCTS_ENDPOINTS),
  ...Object.values(LISTS_ENDPOINTS),
  ...Object.values(PANTRIES_ENDPOINTS),
  ...Object.values(PURCHASES_ENDPOINTS),
];

export const anonymousRoutes: Endpoint[] = [
  ...Object.values(DOCS_ENDPOINTS),
  ...Object.values(USER_ENDPOINTS),
];

export default ENDPOINTS_ROOT;