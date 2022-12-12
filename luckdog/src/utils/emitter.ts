import { EventHub } from '@/luckbox';

export enum events {
  DO_COLLECT_ANIMATION = 'DO_COLLECT_ANIMATION',
  CANCLE_COLLECT_ANIMATION = 'CANCLE_COLLECT_ANIMATION',
  /** 滑动至寒假活动书单页面 */
  DO_SCROLL_TO_WINTER_PAGE_BOOKLIST = 'DO_SCROLL_TO_WINTER_PAGE_BOOKLIST',
  /** 地址更新通知半浮层弹窗重置状态位 */
  HALF_WEBVIEW_RESET_STATUS = 'HALF_WEBVIEW_RESET_STATUS',
  /** tab数据刷新成功（下拉刷新、底部icon点击、顶部当前tab点击触发的刷新） */
  REFRESH_COMPLETE = 'REFRESH_COMPLETE',
  /** 红点取消 */
  RED_DOT_CANCELED = 'RED_DOT_CANCELED',
  /** 通知pageView，对局部刷新后的卡片数据进行本地数据更新 */
  UPDATE_PAGEVIEW_DATASOURCE = 'UPDATE_PAGEVIEW_DATASOURCE',
}

/**
 * 构造一个默认的订阅发布器
 */
export const emitter = EventHub();
