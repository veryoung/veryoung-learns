import { LocalStorage, SharedSettingStorage } from '@tencent/luckbox-hippy-storage';
import FeedsUtils from '../framework/FeedsUtils';
import { logError } from '@/luckdog';

let sharedStorage: LocalStorage;

const isReady = (): boolean => {
  if (sharedStorage) return true;
  return false;
};

export const initSharedStorage = (qbVersionNum: number): void => {
  sharedStorage = new LocalStorage({
    showDebug: false,
    prefix: 'NovelTab',
    hostStorage: SharedSettingStorage.create(FeedsUtils.isAndroid(), qbVersionNum),
    reportError: logError,
    useMemoryCache: false,
  });
};

export const readSharedSettings = <T = any>(keyName: string): Promise<T> => (isReady() ? sharedStorage.getItem<T>(keyName) : Promise.resolve('' as any));

// eslint-disable-next-line max-len
export const writeSharedSettings = <T = string>(keyName: string, value: T, expire?: number): Promise<void> => (isReady() ? sharedStorage.setItem(keyName, value, expire) : Promise.resolve());

// eslint-disable-next-line max-len
export const removeSettings = (keyName: string): Promise<void> => (isReady() ? sharedStorage.removeItem(keyName) : Promise.resolve());
