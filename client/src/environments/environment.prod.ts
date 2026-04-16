type RuntimeEnv = {
  apiUrl?: string;
};

const runtimeEnv = (globalThis as { __env?: RuntimeEnv }).__env;
const browserOrigin = globalThis.location?.origin || '';

const normalizeUrl = (url?: string): string => {
  const resolvedUrl = url?.trim() || browserOrigin;

  return resolvedUrl.endsWith('/') ? resolvedUrl.slice(0, -1) : resolvedUrl;
};

export const environment = {
  production: true,
  apiUrl: normalizeUrl(runtimeEnv?.apiUrl)
};
