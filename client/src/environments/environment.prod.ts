type RuntimeEnv = {
  apiUrl?: string;
};

const runtimeEnv = (globalThis as { __env?: RuntimeEnv }).__env;

export const environment = {
  production: true,
  apiUrl: runtimeEnv?.apiUrl || 'https://web-production-7e19b.up.railway.app'
};
