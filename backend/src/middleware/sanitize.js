const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);

const isForbiddenKey = (key) => key.startsWith('$') || key.includes('.');

const stripOperators = (value, depth = 0) => {
  if (depth > 8) return undefined;
  if (Array.isArray(value)) return value.map((item) => stripOperators(item, depth + 1));
  if (!isPlainObject(value)) return value;

  return Object.entries(value).reduce((acc, [key, child]) => {
    if (isForbiddenKey(key)) return acc;
    acc[key] = stripOperators(child, depth + 1);
    return acc;
  }, {});
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body) req.body = stripOperators(req.body);
  if (req.params) req.params = stripOperators(req.params);

  const query = req.query;
  if (query && Object.keys(query).some(isForbiddenKey)) {
    Object.defineProperty(req, 'query', {
      value: stripOperators(query),
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }

  next();
};
