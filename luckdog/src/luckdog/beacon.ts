import { Platform } from '@tencent/hippy-react-qb';
import { logError } from './logger';
import { getQbUrl, getSearchParams, getTabfrom, isTopTab, getDeviceVisitor, getUserVisitor } from '@/luckbox';
import FeedsConst, { DEFAULT_SCENEID } from '../framework/FeedsConst';
import beacon from './hippy_beacon';
import {
  FeedsUDSEvent,
  sendEvent,
  NOVEL_EVENT,
  addKeylink,
  KeylinkCmd,
  PageModule,
  TechKey,
  BusiKey,
  reportOnActiveEventKeys,
  parseEventKey,
  realTimeEventKeys,
} from '.';
import NovelDoReportUgUtil from '../feeds-styles/tab-22/components/reportUG';

import { ItemBean } from '../entity';

import { ReportInfo } from '../framework/protocol/card';

interface BigDataInfo {
  strageid?: string;
  channelid?: string;
  traceid?: string;
  sceneid?: string;
  reqid?: string;
  bidlist?: string;
  bigdata_contentid?: string;
  bigdata_reason?: string;
  squence?: string;
  position?: string;
}
type BeaconReportData = Record<string, any>;
export interface BeaconReportProps {
  selectTabID?: number;
  tabId?: number;
  itemBean?: ItemBean;
  reportInfo?: ReportInfo;
}

const dict = {
  sPolicyId: 'strageid',
  sChannel: 'channelid',
  sTraceId: 'traceid',
  sSenceId: 'sceneid',
  sReqId: 'reqid',
  bidlist: 'bidlist',
  sContentId: 'bigdata_contentid',
  sReason: 'bigdata_reason',
  sendSequence: 'squence',
  showPosition: 'position',
  bigdata_extinfo: 'bigdata_extinfo',
};

/** 历史遗留原因，技术事件的page_module命名不做调整 */
const getTechEventPageModule = () => (isTopTab() ? 'novel_tab_page' : PageModule.BOTTOM_TAB_PAGE);

export const parseBigDataFromItemBean = (itemBean: ItemBean = {}): BigDataInfo => {
  const reportInfoArr = itemBean?.report_info;
  if (!reportInfoArr?.length || !Array.isArray(reportInfoArr)) return {};
  return reportInfoArr.reduce((acc, item) => {
    const [key, value] = item;
    const finalKey = dict[key];
    if (!finalKey) return acc;
    return {
      ...acc,
      [finalKey]: value,
    };
  }, {});
};

export const getRecommendCardId = (traceid = ''): string => {
  if (!traceid || traceid.length < 4) return '';
  return traceid.substr(0, 4);
};

export const transTimeToSeconds = (milliseconds: number): number => Math.round(milliseconds / 1000);

/** 获取platform */
const getPlatform = () => (Platform.OS === 'ios' ? 'IOS' : 'ADR');

/** 获取渠道号 */
const getChannelid = () => getSearchParams()?.ch || '';

/** 上报数据拼装 */
const makeBaseData = async (
  eventName: string,
  props: BeaconReportProps = {} as any,
  moreData: BeaconReportData = {},
) => {
  try {
    const { selectTabID, tabId, itemBean = {} } = props;
    const { id, guid, qua2, qimei, idfv, oaid } = await getDeviceVisitor().isReady();
    const { uin, qbid } = await getUserVisitor().isUserReady();
    const pageUrl = getQbUrl();
    const [act, page, pageModule] = eventName.split('#');
    const data: FeedsUDSEvent = {
      eventName: NOVEL_EVENT,
      act,
      page,
      page_module: pageModule,
      isRealTime: true,
      novel_platfrom: getPlatform(),
      apptype: 'qbread',
      page_url: encodeURIComponent(pageUrl),
      novel_channel: getTabfrom(),
      tab_id: `${FeedsConst.getGlobalConfKV('curTabId') || selectTabID || tabId || ''}`,
      book_id: '',
      ui_type: `${itemBean.ui_style || ''}`,
      channelid: getChannelid(),
      ...parseBigDataFromItemBean(itemBean),
      ...moreData,
      // 进入曝光和真实曝光必传, 影响新增用户DAU计算
      androidID: id,
      oaid,
      idfa: idfv,
      guid,
      qua2: encodeURIComponent(qua2),
      qimei,
      uid: uin,
      qbid,
      version: getDeviceVisitor().getQbVersion(),
      rn_version: getDeviceVisitor().getJsVersion(),
    };
    data.card_id = getRecommendCardId(data.traceid);
    return data as any;
  } catch (err) {
    logError(err, 'beacon.makeBaseData');
    return {} as any;
  }
};

/** 旧灯塔上报, 用于上报技术指标 */
export const reportBeacon = async (
  eventKey: TechKey,
  props: BeaconReportProps = {},
  moreData: BeaconReportData = {},
): Promise<void> => {
  try {
    if (!eventKey) {
      addKeylink(`[reportBeacon] eventKey(${eventKey}) not exist!`);
      return;
    }

    const [act, eventModule] = parseEventKey(eventKey);
    const pageModule = getTechEventPageModule();
    const eventName = [act, pageModule, eventModule].join('#');

    // eventName 必须符合 xxx#xxx#xxx 格式
    if (!/^\w+#\w+#\w+$/.test(eventName)) {
      addKeylink(`[reportBeacon] eventName(${eventName}) invalid!`);
      addKeylink('invalid-event-name', KeylinkCmd.PR_ERROR_SUM);
      return;
    }
    const data = await makeBaseData(eventName, props, moreData);
    beacon(eventName, data);
  } catch (err) {
    logError(err, 'beacon.reportBeacon');
  }
};

/**
 * UDS 上报，所有的用户行为上报走这里
 */
export const reportUDS = async (
  eventKey: BusiKey,
  props: BeaconReportProps = {},
  moreData: BeaconReportData = {},
): Promise<void> => {
  try {
    if (!checkBeforeReport(eventKey)) {
      return;
    }
    if (!BusiKey[eventKey]) {
      addKeylink('no-uds-eventkey', KeylinkCmd.PR_ERROR_SUM);
      return;
    }
    const [act, eventModule] = parseEventKey(eventKey);
    const data = await makeBaseData('', props, moreData);
    const reportData = {
      ...data,
      act,
      page: 'novel',
      page_module: isTopTab() ? PageModule.TOP_TAB_PAGE : PageModule.BOTTOM_TAB_PAGE,
      event_module: eventModule,
      novel_platfrom: undefined,
      novel_platform: data.novel_platfrom,
      rn_version: undefined,
      js_version: data.rn_version,
      last_action: eventKey,
      isRealTime: realTimeEventKeys.includes(eventKey),
      report_time: Date.now(),
      sceneid: data.sceneid || DEFAULT_SCENEID,
    };
    sendEvent(NOVEL_EVENT, eventModule, reportData);
    return reportData;
  } catch (err) {
    logError(err, 'beacon.reportUDS');
  }
};

/** 时长心跳上报间隔 4s */
export const STAT_USING_TIME_STEP = 4000;

/** UDS 卡片曝光 */
export const reportUDSExpose = (
  eventKey: BusiKey,
  itemBean: ItemBean = {},
  otherProps: BeaconReportData = {},
): void => {
  reportUDS(eventKey, { itemBean }, otherProps);
  // 实时 dau 保持跟卡片曝光的口径和时机
  if (FeedsConst.getGlobalConfKV('initActive')) {
    (NovelDoReportUgUtil as any).sendReport();
  }
};

/** 上报前检查是否满足条件 */
export const checkBeforeReport = (eventKey: BusiKey): boolean => {
  if (!FeedsConst.getGlobalConfKV('initActive') && reportOnActiveEventKeys.includes(eventKey)) {
    return false;
  }
  return true;
};

/** 记录第一次主动行为上报 */
let isActiveInteractionReported = false;
/** 上报第一次主动行为 */
export const reportFirstActiveInteraction = (): void => {
  if (isActiveInteractionReported) return;
  isActiveInteractionReported = true;
  reportUDS(BusiKey.SLIDE__ACTIVE_INTERACTION);
};
