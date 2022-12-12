import { addKeylink, logError } from '@/luckdog';
import { NovelAdSdk } from '@tencent/luckbox-hippy-ad';

let novelAdSdk: NovelAdSdk;

/** 激励视频广告sdk */
export const getNovelAdSdk = (): NovelAdSdk => {
  if (!novelAdSdk) {
    novelAdSdk = new NovelAdSdk({
      logError,
      addKeyLink: addKeylink,
    });
  }
  return novelAdSdk;
};
