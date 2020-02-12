import getDeviceInfo from 'GIAPDeviceInfo';

export const collectDefaultProps = (persistence, config) => ({
  ...getDeviceInfo(),
  lib: config.LIB,
  libVersion: config.LIB_VERSION,
  ...persistence.getPersistedProps(),
});
