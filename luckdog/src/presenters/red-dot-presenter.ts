import { AsyncStorage } from '@tencent/hippy-react-qb';
import FeedsTraversal from '../communication/FeedsTraversal';
import FeedsConst, { BOTTOM_BUSINESS_ID, singChannelAppId } from '../framework/FeedsConst';
import FeedsEventHub from '../framework/FeedsEventHub';
import { addKeylink, logError, reportUDS, BusiKey } from '@/luckdog';
import { TabId } from '../entity';
import { emitter, events } from '../utils/emitter';

const TAG = 'RedDotPresenter';
export const CacheKey = `${FeedsEventHub.event.moduleName}:redDotUpdate`;

/** 书籍更新红点配置 */
export interface RedDotConfig {
  /** 书籍上一次更新的时间 */
  lastUpdatedTime: number;
  /** 红点更新的红点数 */
  updateNum: number;
  /** 是否命中新样式 */
  isNewStyle: boolean;
  /** 是否命中书架更新卡片实验 */
  isUpdateBookCardStyle: boolean;
}

export class RedDotPresenter {
  /** 红点配置 */
  private redDotConfig = {
    lastUpdatedTime: 0,
    updateNum: 0,
    isNewStyle: false,
    isUpdateBookCardStyle: false,
  };

  private fetchRedDotPromise;

  public get getRedDot() {
    return this.redDotConfig;
  }

  public setRedDot(val: any) {
    this.redDotConfig = { ...this.redDotConfig, ...val };
  }

  /** 获取红点配置 */
  public async getRedDotConfig() {
    // 已有内容了就直接返回
    if (this.redDotConfig.updateNum && this.redDotConfig.lastUpdatedTime) {
      return this.redDotConfig;
    }
    try {
      const res = await Promise.all([AsyncStorage.getItem(CacheKey), this.setRedDotConfig()]);
      const lastUpdateTime = res[0] || '0';
      const lastTime = parseInt(lastUpdateTime, 10);
      // 书籍最后更新时间未变更，则不在我的书架卡片展示数字红点
      if (this.redDotConfig.lastUpdatedTime === lastTime) {
        this.redDotConfig.updateNum = 0;
      }
      addKeylink('getRedDotConfig(), 红点未命中缓存期', TAG);
      reportUDS(BusiKey.EXPOSE__BOOK_SHELF_RED_DOT);
    } catch (e) {
      logError(e, `${TAG}.getRedDotConfig`);
    }
    return this.redDotConfig;
  }

  /** 取消红点 */
  public cancelRedDot() {
    const { lastUpdatedTime } = this.redDotConfig;
    this.redDotConfig.updateNum = 0;
    emitter.emit(events.RED_DOT_CANCELED);
    // 设置一下更新时间
    AsyncStorage.setItem(CacheKey, lastUpdatedTime);
  }

  /** 设置红点信息 */
  public async setRedDotConfig(): Promise<void> {
    addKeylink('setRedDotConfig() start, 开始拉取红点内容', TAG);
    if (!this.fetchRedDotPromise) this.fetchRedDotPromise = this.getRedDotInfo();
    try {
      this.redDotConfig = await this.fetchRedDotPromise;
    } catch (e) {
      logError(e, `${TAG}.setRedDotConfig`);
    }
  }

  /** 是否支持展示红点 */
  public enableRedDotShow(redDotConfig: RedDotConfig): boolean {
    const { isNewStyle, isUpdateBookCardStyle } = redDotConfig;

    addKeylink(`enableRedDotShow isNewStyle:${isNewStyle}, isUpdateBookCardStyle:${isUpdateBookCardStyle}`, TAG);

    // 命中isUpdateBookCardStyle实验 或者 不命中isNewStyle实验时，支持展示红点
    return isUpdateBookCardStyle || !isNewStyle;
  }

  /** 请求红点信息 */
  private async getRedDotInfo(): Promise<RedDotConfig> {
    try {
      const res = await FeedsTraversal.traversal(
        TabId.SHELF,
        BOTTOM_BUSINESS_ID,
        { func: 'BookUpdatedRedDot' },
        FeedsConst.getGlobalConf(),
        {},
        true,
        singChannelAppId,
      );
      if (res.success && res.content) {
        const { updateNum, lastUpdatedTime, isNewStyle } = res.content;
        addKeylink(`getRedDotInfo(), 成功拉取到红点内容, 更新时间=${lastUpdatedTime}, 是否命中新样式=${isNewStyle}, 红点数=${updateNum}`, TAG);
        return res.content;
      }
    } catch (e) {
      logError(e, `${TAG}.getRedDotInfo`);
    }
    return this.redDotConfig;
  }
}

let presenter: RedDotPresenter;

export const getRedDotPresenter = (): RedDotPresenter => {
  if (presenter) return presenter;
  presenter = new RedDotPresenter();
  return presenter;
};

