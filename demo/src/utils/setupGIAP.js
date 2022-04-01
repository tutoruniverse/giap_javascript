import giap from '../../../src';
import { GIAP_API_URL, GIAP_TOKEN } from '../constants/app';

export default () => {
  giap.initialize(GIAP_TOKEN, GIAP_API_URL);

  giap.notification.didResetWithDistinctId = (distinctId) => {
    console.log(`GIAP didResetWithDistinctId: ${distinctId}`);
  };

  giap.notification.didEmitEvents = (events, responseData) => {
    console.log('GIAP didEmitEvent: ', events);
    console.log('   Response: ', responseData);
  };

  giap.notification.didUpdateProfile = ({ id, props }, responseData) => {
    console.log(`GIAP didUpdateProfile: ${id} with withProperties: `, props);
    console.log('   Response: ', responseData);
  };

  giap.notification.didCreateAliasForUserId = (
    { userId, distinctId },
    responseData,
  ) => {
    console.log(
      `GIAP didCreateAliasForUserId: ${userId} withDistinctId ${distinctId}`,
    );
    console.log('   Response: ', responseData);
  };

  giap.notification.didIdentifyUserId = (
    { userId, distinctId },
    responseData,
  ) => {
    console.log(
      `GIAP didIdentifyUserId: ${userId} withCurrentDistinctId ${distinctId}`,
    );
    console.log('   Response: ', responseData);
  };
};
