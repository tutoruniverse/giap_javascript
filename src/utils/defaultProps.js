import getDeviceInfo from './deviceInfo';
import { LIB, LIB_VERSION } from '../constants/lib';
import { mapKeys } from './object';

export default (name, persistence) =>
  mapKeys(
    {
      name,
      lib: LIB,
      libVersion: LIB_VERSION,
      ...persistence.getPersistedProps(),
      ...getDeviceInfo(),
    },
    (key) => `$${key}`,
  );
