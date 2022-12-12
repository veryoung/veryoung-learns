// 精彩节选
import React from 'react';
import { Text, View, Image, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsIcon from '../../framework/FeedsIcon';
import FeedsTheme from '../../framework/FeedsTheme';
import { ConstantUtils, FeedsUtils } from './components/utils';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsViewItem from '../FeedsViewItem';
import FeedsViewContainer from '../common/FeedsViewContainer';
import { PicTextBtn } from './components';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { FeedsLineHeight, FeedsUIStyle, CommonCardStyle } from '../../framework/FeedsConst';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { isTopTab } from '@/luckbox';
import { CommonProps } from '../../entity';

const objStyles = StyleSheet.create({
  titleWrap: {
    flexDirection: 'row',
  },
  cardTitle: {
    lineHeight: 32,
    paddingHorizontal: 10,
    backgroundColors: FeedsTheme.SkinColor.N3,
    colors: FeedsTheme.SkinColor.D5_2,
    fontSize: FeedsUIStyle.T3,
    marginLeft: 19,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  bgImg: {
    alignSelf: 'stretch',
    backgroundColors: FeedsTheme.SkinColor.D5_1,
    bottom: 0,
    flexDirection: 'column',
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 8,
  },
  topWrapper: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  splitLine: {
    marginTop: 10,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  splitImg: {
    height: 4,
  },
  style: {
    marginTop: 7,
  },
  picStyle: {
    width: 42,
    height: 56,
  },
  blockStyle: {
    height: 56,
    marginBottom: 24,
    marginRight: 8,
  },
  textStyle: {
    lineHeight: FeedsLineHeight.T4,
    fontsize: 17,
    colors: FeedsTheme.SkinColor.N1_3,
  },
  subTextStyle: {
    colors: FeedsTheme.SkinColor.N1_3,
  },
  txt: {
    fontSize: 16,
    colors: FeedsTheme.SkinColor.N1_3,
    lineHeight: 26,
    textAlign: 'justify',
  },
});


const bgImg = FeedsIcon.novel_413_background;

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle413 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 413;
  }

  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle413');

  public onClick = (url) => {
    const itemBean = FeedsUtils.getSafeProps(this.props, 'itemBean', {});
    const data = itemBean.parsedObject;
    if (data) {
      reportUDS(BusiKey.CLICK__CARD, this.props, { book_id: data.sResourceId });
    }
    super.onClick(url);
  };

  public getSplitLine = () => (
    <View style={objStyles.splitLine}>
      <Image
        source={{ uri: FeedsIcon.splitImg }}
        style={objStyles.splitImg}
      />
    </View>
  );

  public onLayout = (event, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookId,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle413');
    const { itemBean = {}, globalConf } = this.props;
    const parsedObject = itemBean.parsedObject || {};
    const { sSummary = '', sTitle = '', sPicUrl = '', sTag = '', sBookId } = parsedObject;

    const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
    const BGIMG_WIDTH = SCREEN_WIDTH - 24;

    return (
      <View
        style={{
          ...!isTopTab() && CommonCardStyle,
        }}
        onLayout={event => this.onLayout(event, sBookId)}
      >
        <Image
          source={{ uri: bgImg }}
          style={[objStyles.bgImg, { width: BGIMG_WIDTH }]}
        />
        <FeedsViewContainer
          parentProps={this.props}
          noPressState
          onClick={strictExposeReporter.triggerExpoCheck(() => this.onClick(itemBean.url))}
          noPadding
        >
          <View style={objStyles.titleWrap}>
            <Text style={objStyles.cardTitle}>{itemBean.title || '精彩节选'}</Text>
          </View>

          <View style={objStyles.topWrapper}>
            <Text style={objStyles.txt} numberOfLines={6}>
              {`\u3000\u3000${sSummary.trim().replace(/\n/g, '\n\u3000\u3000')}`}
            </Text>
          </View>
          { this.getSplitLine() }

          <PicTextBtn
            picUrl={sPicUrl}
            btnUrl={itemBean.url}
            text={sTitle}
            subText={sTag || ''}
            btnText={'继续阅读'}
            item_id={itemBean.item_id}
            picStyle={objStyles.picStyle}
            textStyle={objStyles.textStyle}
            subTextStyle={objStyles.subTextStyle}
            blockStyle={objStyles.blockStyle}
            parents={this}
            globalConf={globalConf}
            style={objStyles.style}
          />
        </FeedsViewContainer>
      </View>
    );
  }
}
