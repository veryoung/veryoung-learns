import { safeJsonParse } from '../feeds-styles/common/utils';

const NeedToTransform = [437, 438, 441];

/** 将新协议下发的json字符串数据转换成对象 */
export const convertNewProtoStringData2Object = (feedsBean: any): Record<string, any> => {
  const { ui_style: uiStyle, parsedObject } = feedsBean;
  if (NeedToTransform.includes(uiStyle) && typeof parsedObject?.sData === 'string') {
    parsedObject.sData = safeJsonParse(parsedObject.sData);
  }
  return feedsBean;
};
