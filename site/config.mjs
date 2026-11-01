export const site = Object.freeze({
  name: 'omp bazaar',
  domain: 'ompbazaar.beer',
  origin: 'https://ompbazaar.beer',
  repository: 'https://github.com/suj1e/omp-bazaar',
  description: 'Small, deliberate skills for evidence-led work in omp.',
});

export function normalizeBase(value = '') {
  if (!value || value === '/') return '';
  if (!/^\/?[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/?$/.test(value)) {
    throw new Error('BASE_PATH must be a path such as /omp-bazaar/');
  }
  return `/${value.replace(/^\/|\/$/g, '')}`;
}

export function sitePath(path = '', base = '') {
  return `${normalizeBase(base)}/${path.replace(/^\/+/, '')}`;
}
