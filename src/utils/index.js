import Config from '../configuration';
import getDeviceInfo from '../GIAPDeviceInfo';

export const mapKeys = (obj, modifier) => {
  const res = {};
  Object.entries(obj).forEach(([key, value]) => {
    res[modifier(key)] = value;
  });
  return res;
};

export const prepareDefaultProps = (name, persistence) => mapKeys({
  name,
  lib: Config.LIB,
  libVersion: Config.LIB_VERSION,
  ...persistence.getPersistedProps(),
  ...getDeviceInfo(),
}, key => `_${key}`);
