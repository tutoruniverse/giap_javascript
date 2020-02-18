export const mapKeys = (obj, modifier) => {
  const res = {};
  Object.entries(obj).forEach(([key, value]) => {
    res[modifier(key)] = value;
  });
  return res;
};

export const isEmpty = value => value === undefined
          || value === null
          || value === 0
          || (typeof value === 'object' && Object.keys(value).length === 0)
          || (typeof value === 'string' && value.trim().length === 0);


export const createEventsBatch = events => ({ events: events.map(event => event) });
