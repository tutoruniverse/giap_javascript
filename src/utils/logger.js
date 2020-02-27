export default enableLog => ({
  log: (...args) => (enableLog ? console.log(...args) : null),
  group: (...args) => (enableLog ? console.group(...args) : null),
  groupEnd: (...args) => (enableLog ? console.groupEnd(...args) : null),
});
