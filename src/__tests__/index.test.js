import GIAPLib from '..';

describe('index', () => {
  let instance;
  const token = 'secret_token';

  beforeEach(() => {
  });

  const setup = () => {
    instance = new GIAPLib();
    instance.initialize(token);
  };

  it('should have storage persisted', () => {
    setup();
    expect(instance.config.TOKEN).toBe(token);
  });
});
