export default class DeviceInfo {
  static getBrowser = (userAgent, vendor, opera) => {
    if (opera || userAgent.includes(' OPR/')) {
      if (userAgent.includes('Mini')) {
        return 'Opera Mini';
      }
      return 'Opera';
    } if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
      return 'BlackBerry';
    } if (userAgent.includes('IEMobile') || userAgent.includes('WPDesktop')) {
      return 'Internet Explorer Mobile';
    } if (userAgent.includes('SamsungBrowser/')) {
      // https://developer.samsung.com/internet/user-agent-string-format
      return 'Samsung Internet';
    } if (userAgent.includes('Edge') || userAgent.includes('Edg/')) {
      return 'Microsoft Edge';
    } if (userAgent.includes('FBIOS')) {
      return 'Facebook Mobile';
    } if (userAgent.includes('Chrome')) {
      return 'Chrome';
    } if (userAgent.includes('CriOS')) {
      return 'Chrome iOS';
    } if (userAgent.includes('UCWEB') || userAgent.includes('UCBrowser')) {
      return 'UC Browser';
    } if (userAgent.includes('FxiOS')) {
      return 'Firefox iOS';
    }
    // vendor is undefined for at least IE9
    if ((vendor || '').includes('Apple')) {
      if (userAgent.includes('Mobile')) {
        return 'Mobile Safari';
      }
      return 'Safari';
    } if (userAgent.includes('Android')) {
      return 'Android Mobile';
    } if (userAgent.includes('Konqueror')) {
      return 'Konqueror';
    } if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      return 'Internet Explorer';
    } if (userAgent.includes('Gecko')) {
      return 'Mozilla';
    }
    return '';
  }

  static getBrowserVersion = (userAgent, vendor, opera) => {
    const browser = DeviceInfo.getBrowser(userAgent, vendor, opera);
    const versionRegexs = {
      'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
      'Microsoft Edge': /Edge?\/(\d+(\.\d+)?)/,
      Chrome: /Chrome\/(\d+(\.\d+)?)/,
      'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
      'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
      Safari: /Version\/(\d+(\.\d+)?)/,
      'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
      Opera: /(Opera|OPR)\/(\d+(\.\d+)?)/,
      Firefox: /Firefox\/(\d+(\.\d+)?)/,
      'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
      Konqueror: /Konqueror:(\d+(\.\d+)?)/,
      BlackBerry: /BlackBerry (\d+(\.\d+)?)/,
      'Android Mobile': /android\s(\d+(\.\d+)?)/,
      'Samsung Internet': /SamsungBrowser\/(\d+(\.\d+)?)/,
      'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
      Mozilla: /rv:(\d+(\.\d+)?)/,
    };
    const regex = versionRegexs[browser];
    if (regex === undefined) {
      return null;
    }
    const matches = userAgent.match(regex);
    if (!matches) {
      return null;
    }
    return parseFloat(matches[matches.length - 2]);
  }

  static getOs = (userAgent) => {
    if (/Windows/i.test(userAgent)) {
      if (/Phone/.test(userAgent) || /WPDesktop/.test(userAgent)) {
        return 'Windows Phone';
      }
      return 'Windows';
    } if (/(iPhone|iPad|iPod)/.test(userAgent)) {
      return 'iOS';
    } if (/Android/.test(userAgent)) {
      return 'Android';
    } if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
      return 'BlackBerry';
    } if (/Mac/i.test(userAgent)) {
      return 'Mac OS X';
    } if (/Linux/.test(userAgent)) {
      return 'Linux';
    } if (/CrOS/.test(userAgent)) {
      return 'Chrome OS';
    }
    return '';
  }

  static getReferringDomain = (referrer) => {
    const split = referrer.split('/');
    if (split.length >= 3) {
      return split[2];
    }
    return '';
  }

  static getDevice = (userAgent) => {
    if (/Windows Phone/i.test(userAgent) || /WPDesktop/.test(userAgent)) {
      return 'Windows Phone';
    } if (/iPad/.test(userAgent)) {
      return 'iPad';
    } if (/iPod/.test(userAgent)) {
      return 'iPod Touch';
    } if (/iPhone/.test(userAgent)) {
      return 'iPhone';
    } if (/(BlackBerry|PlayBook|BB10)/i.test(userAgent)) {
      return 'BlackBerry';
    } if (/Android/.test(userAgent)) {
      return 'Android';
    }
    return '';
  }

  static getSearchEngine = (referrer) => {
    if (referrer.search('https?://(.*)google.([^/?]*)') === 0) {
      return 'google';
    } if (referrer.search('https?://(.*)bing.com') === 0) {
      return 'bing';
    } if (referrer.search('https?://(.*)yahoo.com') === 0) {
      return 'yahoo';
    } if (referrer.search('https?://(.*)duckduckgo.com') === 0) {
      return 'duckduckgo';
    }
    return null;
  }
}
