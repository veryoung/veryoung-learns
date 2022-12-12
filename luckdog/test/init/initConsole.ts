/* eslint-disable no-console */

const initConsole = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    if (typeof args[0] === 'string' && [
      '%c[event]%c',
    ].find(str => args[0].startsWith(str))) {
      return;
    }
    return originalLog.apply(this, args);
  };

  console.error = (...args) => {
    if (args && typeof args[0] === 'string' && [
      'Warning: Received `%s` for a non-boolean attribute',
      'Warning: Unknown event handler property',
      'Warning: React does not recognize',
      'Warning: Can\'t perform a React state update on an unmounted component.',
      'Warning: Can\'t call setState on a component that is not yet mounted',
      'removeEventListener, this deactive is not exist',
    ].find(str => args[0].startsWith(str))) {
      return;
    }
    return originalError.apply(this, args);
  };

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && [
      'Animation.destory() method will be deprecated soon,',
      'Warning: componentWillMount has been renamed',
      'Warning: componentWillUpdate has been renamed',
      'Warning: componentWillReceiveProps has been renamed',
      'WupModule will be removed in 2.3',
    ].find(str => args[0].startsWith(str))) {
      return;
    }
    return originalWarn.apply(this, args);
  };
};

initConsole();

export default initConsole;
