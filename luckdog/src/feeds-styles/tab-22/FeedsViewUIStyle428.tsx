/**
 * Pick主角/技能
 */

import React from 'react';
import { View, StyleSheet, Image } from '@tencent/hippy-react-qb';
import { FeedsUtils, vectorToArray } from './components/utils';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import { Title } from './components';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, strictExposeReporter, BusiKey, logError } from '@/luckdog';
import FeedsConst, { CommonCardStyle, FeedsUIStyle } from '../../framework/FeedsConst';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { getWidthHeight } from '../../framework/utils/device';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { CommonProps } from '../../entity';

const windowWidth = getWidthHeight().width;
const imageMode4Width = (windowWidth - 32 - 24 - 9) / 2;
const imageMode4HeightScale = 216 / 310;
const imageMode4Height = imageMode4Width * imageMode4HeightScale;

const imageMode6Width = (windowWidth - 32 - 24 - 16) / 3;
export const pickCardExposeTimeKey = 'PICK_CARD_EXPOSE_TIME_428_KEY';

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pic: {
    borderRadius: 6,
    marginBottom: 8,
  },
  pic_item4: {
    width: imageMode4Width,
    height: imageMode4Height,
  },
  pic_item6: {
    width: imageMode6Width,
    height: imageMode6Width,
  },
});

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle428 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 428;
  }

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle428');
  }

  public doBeaconByClick = (index = 0) => {
    try {
      // 获取所点击图片的resourceId
      const { itemBean = {} } = this.props;
      const { report_info: reportInfo = [] } = itemBean;
      let contentId = '';
      reportInfo?.forEach(([key, value]) => {
        if (key === 'sContentId') contentId = value;
      });
      const contentIds = contentId?.split(',');
      const bookId = contentIds && contentIds.length > index && contentIds[index];

      reportUDS(BusiKey.CLICK__CARD, this.props, {
        bigdata_contentid: '',
        book_id: bookId,
      });
    } catch (error) {
      logError(error, 'ui428 doBeaconByClick throw error');
    }
  };

  public onClickPic = (jumpUrl = '', index = 0) => {
    if (!jumpUrl) return;

    // 预加载阅读器中图片
    const urlParams = FeedsUtils.parseQueryString(jumpUrl);
    const prePicUrl = urlParams?.banner_url && decodeURIComponent(urlParams.banner_url);
    prePicUrl && Image.prefetch(prePicUrl);

    this.loadUrl(jumpUrl);

    // 点击上报
    this.doBeaconByClick(index);
  };

  public getItemBlock = (item, itemStyleName, index) => {
    const { itemBean = {} } = this.props;
    const { item_id: itemId = '' } = itemBean;
    const { sPicUrl = '', sUrl = '' } = item || {};
    if (!sPicUrl || !sUrl) return null;
    return (
      <View
        onClick={strictExposeReporter.triggerExpoCheck(() => this.onClickPic(sUrl, index))}
        key={`${itemId}-pic${index}`}
      >
        <Image
          source={{ uri: sPicUrl }}
          style={[styles.pic, styles[`pic_${itemStyleName}`]]}
          reportData={{ sourceFrom: itemId }}
          noPicMode={{ enable: true }}
        />
      </View>
    );
  };

  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
      afterExpose: this.recordPickCardExpoTimes,
    });
  };

  // 在pick主角卡片曝光后需要记录曝光次数
  public recordPickCardExpoTimes = async () => {
    try {
      const exposedTime = FeedsConst.getGlobalConfKV(pickCardExposeTimeKey)
      || (await readSharedSettings(pickCardExposeTimeKey))
      || 0;
      FeedsConst.setGlobalConfKV(pickCardExposeTimeKey, exposedTime + 1);
      writeSharedSettings(pickCardExposeTimeKey, exposedTime + 1);
    } catch (error) {
      logError(error, 'recordPickCardExpoTimes pickCardExposedTime failed');
    }
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle428');
    const { itemBean = {}, globalConf = {}, index = 0 } = this.props;
    const { parsedObject = {}, title } = itemBean || {};
    const items = vectorToArray(parsedObject.vDetailData);
    let itemStyleName = '';
    const itemLength = items.length;
    const FOUR_ITEM = 4;
    const SIX_ITEM = 6;

    // 长度小于3个不展示，长度在4-5个显示为4个，长度大于6个显示为6个
    if (itemLength >= 0 && itemLength < FOUR_ITEM) {
      return (<View></View>);
    }
    if (itemLength >= FOUR_ITEM && itemLength < SIX_ITEM) {
      itemStyleName = 'item4';
      itemLength > FOUR_ITEM && items.splice(0, FOUR_ITEM);
    } else if (itemLength >= SIX_ITEM) {
      itemStyleName = 'item6';
      itemLength > SIX_ITEM && items.splice(0, SIX_ITEM);
    }

    return (
      <View
        style={[
          CommonCardStyle,
          index === 0 ? { marginTop: FeedsUIStyle.T3 } : {},
        ]}
        onLayout={this.onLayout}
      >
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        {items && items.length > 0 ? (
          <View>
            <Title
              title={title}
              changeable={false}
              parent={this}
            />
            <View style={ styles.listWrap }>
              {
                items.map((item, index) => (
                  this.getItemBlock(item, itemStyleName, index)
                ))
              }
            </View>
          </View>
        ) : null}
      </View>
    );
  }
}
