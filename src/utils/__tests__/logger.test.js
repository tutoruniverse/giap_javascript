import createLogger from '../logger';

describe('utils/logger', () => {
  it('should create logger correctly', () => {
    ['log', 'group', 'groupEnd'].forEach((element) => {
      const consoleFn = jest.spyOn(console, element);
      createLogger(false)[element]('test');
      expect(consoleFn).not.toHaveBeenCalled();
      createLogger(true)[element]('test');
      expect(consoleFn).toHaveBeenCalledWith('test');
    });
  });
});
