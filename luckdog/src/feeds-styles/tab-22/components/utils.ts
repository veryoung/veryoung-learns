import FeedsUtils from '../../../framework/FeedsUtils';
import FeedsTraversal from '../../../communication/FeedsTraversal';
import {
  FeedsUIStyle,
  FeedsLineHeight,
  FeedsItemBottomLineType,
} from '../../../framework/FeedsConst';
import FeedsIcon from '../../../framework/FeedsIcon';
import FeedsTheme from '../../../framework/FeedsTheme';
import { ConstantUtils, FormatUtils } from '../../common/utils';
import { CardLinkType } from '../../../entity/card';

/**
 * 根据下发的数据来判断当前右上角链接如何生效
 * linkType 0 无实验下发 1.查看更多 2.局部刷新换一换
 * @param {*} props 卡片的props
 * @param {*} doBeaconCardMore 查看更多曝光上报函数
 */
const getTitleRight = (props) => {
  const { linkName = false, linkType = 0, moreLink = '', vTextLink = {} } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
  const titleRight = vectorToArray(vTextLink)[0] || {};
  switch (linkType) {
    case CardLinkType.NONE:
      return titleRight;
    case CardLinkType.MORE:
      return {
        sText: linkName,
        sUrl: moreLink,
      };
    case CardLinkType.CHANGE:
      return {};
    default:
      return titleRight;
  }
};


/**
 * @param 将vector对象转成数组
 * vector本身可以为数组
 */
const vectorToArray = function (vector) {
  return (vector?.value) || (Array.isArray(vector) && vector) || [];
};

export {
  FeedsUIStyle,
  FeedsLineHeight,
  FeedsIcon,
  FeedsItemBottomLineType,
  FeedsTheme,
  FeedsUtils,
  FeedsTraversal,
  ConstantUtils,
  FormatUtils,
  vectorToArray,
  getTitleRight,
};
