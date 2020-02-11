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

  const res = { ...props };

  res.time = Date.now();
  res.screenHeight = screen.height;
  res.screenWidth = screen.width;
  res.browser = DeviceInfo.getBrowser(userAgent, vendor, opera);
  res.browserVersion = DeviceInfo.getBrowserVersion(userAgent, vendor, opera);
  res.currentUrl = location.href;
  res.os = DeviceInfo.getOs(userAgent);
  res.referrer = referrer;
  res.referringDomain = DeviceInfo.getReferringDomain(referrer);
  res.searchEngine = DeviceInfo.getSearchEngine(referrer);
  res.device = DeviceInfo.getDevice(userAgent);
  return res;
};
