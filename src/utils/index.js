import Config from '../configuration';
import getDeviceInfo from '../GIAPDeviceInfo';

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

export const prepareDefaultProps = (name, persistence) => mapKeys({
  name,
  lib: Config.LIB,
  libVersion: Config.LIB_VERSION,
  ...persistence.getPersistedProps(),
  ...getDeviceInfo(),
}, key => `_${key}`);

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
};