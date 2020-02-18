export default enableLog => ({
  log: (...args) => (enableLog ? console.log(...args) : ''),
  group: (...args) => (enableLog ? console.group(...args) : ''),
  groupEnd: (...args) => (enableLog ? console.groupEnd(...args) : ''),
});
