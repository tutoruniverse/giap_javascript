import getDeviceInfo from '../GIAPDeviceInfo';
import CaseConverter from './caseConverter';

export const prepareDefaultProps = (persistence, config) => ({
  ...getDeviceInfo(),
  lib: config.LIB,
  libVersion: config.LIB_VERSION,
  ...persistence.getPersistedProps(),
});

export const prepareRequestProps = (defaultProps, customProps) => {
  const res = {};
  Object.entries(defaultProps).forEach(
    ({ k, v }) => { res[`_${CaseConverter.camelCaseToSnakeCase(k)}`] = v; }
  );
  Object.entries(customProps).forEach((
    { k, v }) => { res[`$${CaseConverter.camelCaseToSnakeCase(k)}`] = v; }
  );
  return res;
};
