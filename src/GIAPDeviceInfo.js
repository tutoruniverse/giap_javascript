/** ADD PROPERTIES
 *  time
 *  screen_height
 *  screen_width
 *  browser
 *  browser_version
 *  current_url
 *  os
 *  referrer
 *  referring_domain
 *  search_engine
 *  search_keyword
 *  device
*/
import DeviceInfo from 'utilities/deviceInfo';

export default (props, windowCurrent = window) => {
  const { screen, opera, navigator, document, location } = windowCurrent;
  const { userAgent, vendor } = navigator;
  const { referrer } = document;

  return {
    time: Date.now(),
    screenHeight: screen.height,
    screenWidth: screen.width,
    browser: DeviceInfo.getBrowser(userAgent, vendor, opera),
    browserVersion: DeviceInfo.getBrowserVersion(userAgent, vendor, opera),
    currentUrl: location.href,
    os: DeviceInfo.getOs(userAgent),
    referrer,
    referringDomain: DeviceInfo.getReferringDomain(referrer),
    searchEngine: DeviceInfo.getSearchEngine(referrer),
    device: DeviceInfo.getDevice(userAgent),
  };
};
