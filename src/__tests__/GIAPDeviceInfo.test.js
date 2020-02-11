/* import PaymentSession from '../PaymentSession'; */
import addDeviceInfo from '../GIAPDeviceInfo';

describe('GIAPDeviceInfo', () => {
  let window;
  let props;
  const mapUserAgent = [
    {
      userAgent: 'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; Lumia 950) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.1058',
      props: {
        os: 'Windows Phone',
        device: 'Windows Phone',
        browser: 'Microsoft Edge',
      } },
    {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
      props: {
        os: 'iOS',
        device: 'iPhone',
        browser: 'Mozilla',
      } },
    {
      userAgent: 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36 ',
      props: {
        os: 'Android',
        device: 'Android',
        browser: 'Chrome',
      } },
    {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
      props: {
        os: 'Windows',
        device: '',
        browser: 'Microsoft Edge',
      } },
    {
      userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
      props: {
        os: 'Linux',
        device: '',
        browser: 'Firefox',
      } },
    {
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36',
      props: {
        os: 'Chrome OS',
        device: '',
        browser: 'Chrome',
      } },
    {
      userAgent: 'Roku4640X/DVP-7.70 (297.70E04154A)',
      props: {
        os: '',
        device: '',
        browser: '',
      } },
    {
      userAgent: 'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.35+ (KHTML, like Gecko) Version/10.3.2.2876 Mobile Safari/537.35+',
      props: {
        os: 'BlackBerry',
        device: 'BlackBerry',
        browser: 'BlackBerry',
      } },
    {
      userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10 ',
      props: {
        os: 'iOS',
        device: 'iPad',
        browser: 'Mozilla',
      } },
    {
      userAgent: 'Mozilla/5.0 (iPod; CPU iPod OS 7_0_2 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Mobile/11A501',
      props: {
        os: 'iOS',
        device: 'iPod Touch',
        browser: 'Mozilla',
      } },
  ];

  beforeEach(() => {
    window = {
      screen: { height: 1680, width: 1050 },
      navigator: {
        userAgent: '"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"',
        vendor: 'Google Inc.' },
      document: { referrer: 'https://www.google.com/' },
      location: { href: 'https://www.got-it.ai/solutions/excel-chat/home' },
    };
  });

  const setup = () => {
    props = addDeviceInfo(props, window);
  };

  it('should collect search engine correctly', () => {
    const map = [
      ['https://www.google.com/', 'google'],
      ['https://vn.yahoo.com', 'yahoo'],
      ['https://vn.bing.com', 'bing'],
      ['http://test.duckduckgo.com', 'duckduckgo'],
      ['https://stackoverflow.com', null],
    ];
    map.forEach(([k, v]) => {
      window.document.referrer = k;
      setup();
      expect(props.searchEngine).toBe(v);
    });
  });

  it('should collect device correctly', () => {
    mapUserAgent.forEach(({ userAgent, props: properties }) => {
      window.navigator.userAgent = userAgent;
      setup();
      expect(props.device).toBe(properties.device);
    });
  });

  it('should collect referring domain correctly', () => {
    setup();
    expect(props.referringDomain).toBe('www.google.com');
    window.document.referrer = '';
    setup();
    expect(props.referringDomain).toBe('');
  });

  it('should collect OS correctly', () => {
    mapUserAgent.forEach(({ userAgent, props: properties }) => {
      window.navigator.userAgent = userAgent;
      setup();
      expect(props.os).toBe(properties.os);
    });
  });

  it('should collect browser correctly', () => {
    mapUserAgent.forEach(({ userAgent, props: properties }) => {
      window.navigator.userAgent = userAgent;
      setup();
      expect(props.browser).toBe(properties.browser);
    });
  });
});
