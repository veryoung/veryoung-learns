const storage = {};

export const initSharedStorage = (): void => {
  //
};

export const readSharedSettings = <T = any>(keyName: string): Promise<T> => storage[keyName];

export const writeSharedSettings = <T = string>(keyName: string, value: T) => storage[keyName] = value;
