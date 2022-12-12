export const getCircularReplacer = (): ((key: any, value: any) => any) => {
  const seen = new WeakSet();
  return (_key: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

/**
 * 格式化可能是Error | String | Any的参数
 */
export const formatAnyVal = (value: unknown[] | Record<string, any> | Error | string): string => {
  if (typeof value === 'string') return value as string;
  if (value instanceof Error) {
    const { message, stack } = value as Error;
    return stack?.includes(message) ? stack : `${(value as any).name}: ${message} \n ${stack}`;
  }
  // Array or Object
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return JSON.stringify(value, getCircularReplacer());
  }
  return (value as unknown) as string;
};

/** 将对象格式化成 key=val 字符串形式 */
export const formatObj2KV = (obj: Record<string, any>): string =>
  !obj
    ? ''
    : Object.keys(obj)
        .reduce((acc: string[], key) => {
          acc.push(`${key}=${obj[key] || ''}`);
          return acc;
        }, [])
        .join(';');

/**
 * 获取形如yyyy-MM-dd hh:mm:ss的格式化时间
 * @param withMsc 是否需要把毫秒数显示出来
 */
export const getFormatTime = (date = new Date()): string =>
  [
    [`${date.getFullYear()}`, `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join(
      '-',
    ),
    [
      `${date.getHours()}`.padStart(2, '0'),
      `${date.getMinutes()}`.padStart(2, '0'),
      `${date.getSeconds()}`.padStart(2, '0'),
    ].join(':'),
  ].join(' ');

/**
 * 将对象转换为qs形式, age=10&name=hello
 */
export const joinParams = (obj: Record<string, any>, needEncode = false): string | Record<string, any> => {
  if (!obj || typeof obj !== 'object') return obj;
  const items = Object.keys(obj).map(key => {
    const val = obj[key];
    if (val === undefined || val === null) {
      return '';
    }
    return `${key}=${needEncode ? encodeURIComponent(val) : val}`;
  });
  return items.join('&');
};

/**
 * 判断是否在electron的运行环境内
 */
export const isElectron = () => {
  // Renderer process
  if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
    return true;
  }

  // Main process
  if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
    return true;
  }

  // Detect the user agent when the `nodeIntegration` option is set to true
  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  return false;
};
