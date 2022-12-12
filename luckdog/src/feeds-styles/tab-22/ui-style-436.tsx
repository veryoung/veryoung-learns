/**
 * 新浅用户福利卡
 */
import React, { ForwardRefRenderFunction, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text, ImageBackground } from '@tencent/hippy-react-qb';
import { FormatUtils } from '../common/utils';
import { strictExposeReporter, reportUDS, BusiKey, logError } from '@/luckdog';
import { WelfareCountDown } from '../../components/welfare-count-down';
import AwardRecordCarousel from '../../components/lottery-record-carousel';
import { showToast } from '@/luckbox';
import FeedsIcon from '../../framework/FeedsIcon';
import FeedsTheme from '../../framework/FeedsTheme';
import { FeedsUIStyle, CardRadius } from '../../framework/FeedsConst';
import { ViewRef } from '@/entity';


const TAG = 'ui-style-436';

/** 内容区域高度 */
const CONTENT_HEIGHT = 150;

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  // 背景图片加载失败时的兼容样式
  imageErrorWrap: {
    height: CONTENT_HEIGHT,
    marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
  },
  content: {
    marginLeft: 12,
    marginRight: 12,
    backgroundColor: '#997649',
    borderRadius: CardRadius,
  },
  contentBg: {
    height: CONTENT_HEIGHT,
    justifyContent: 'space-between',
    resizeMode: 'cover',
    paddingTop: 16,
    paddingLeft: 14,
    paddingRight: 14,
    borderRadius: CardRadius,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 20,
  },
  awardList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bigImage: {
    resizeMode: 'contain',
    width: 93,
    height: 100,
    marginLeft: 2,
  },
  award: {
    alignItems: 'center',
  },
  awardImage: {
    width: 50,
    height: 50,
  },
  awardNameWrap: {
    marginTop: 4,
    paddingTop: 2.5,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 2.5,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  awardName: {
    fontSize: 11,
    colors: FeedsTheme.SkinColor.D2_1,
    textAlign: 'center',
  },
});

const onLayout = (event: Record<string, any>, cardIndex: number): void => {
  strictExposeReporter.addExpoItem({
    cardIndex,
    tabIndex: 0,
    bookIndex: 0,
    bookId: '0',
    rect: event.layout,
  });
};

const onClick = (props: Record<string, any>): void => {
  showToast('读任意小说领福利');
  reportUDS(BusiKey.CLICK__CARD, props);

  // 页面滚动到下一张卡片
  try {
    props.parent.refs.feedsList.scrollToIndex(0, props.index + 1, true);
  } catch (err) {
    logError(err, `${TAG}.onClick`);
  }
};

type Props = {
  itemBean: {
    parsedObject: {
      sData: string;
    }
  },
  index: number;
};

const NewUserWelfareCard: ForwardRefRenderFunction<ViewRef, Props> = (
  props,
  ref: React.Ref<ViewRef>,
): JSX.Element | null => {
  const {
    remainTime = 0, bgImage, bgImageShowRatio, awardRecordList, awardList,
  } = JSON.parse(props.itemBean?.parsedObject?.sData || '{}');

  if (remainTime <= 0 || !awardList?.length) {
    logError(`福利卡数据异常：${props.itemBean?.parsedObject?.sData}`, TAG);
    return null;
  }

  const [imageHeight, setImageHeight] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const size = await Image.getSize(bgImage);
        const height = FormatUtils.formatDesignLength(size.height);
        setImageHeight(height);

        // 卡片的高度 = 图片露出的高度 + 内容的高度
        const cardHeight = (height * bgImageShowRatio) + CONTENT_HEIGHT;
        setHeight(cardHeight);
      } catch (err) {
        logError(err, `${TAG}.fetchImageSize`);
      }
    };

    fetchImageSize();
  }, [bgImage]);

  return (<View
    ref={ref}
    onLayout={event => onLayout(event, props.index)}
    style={[styles.wrap, height === 0 ? styles.imageErrorWrap : { height }]}
    onClick={() => onClick(props)}
  >
    <Image source={{ uri: bgImage }} style={[styles.image, {
      height: imageHeight,
    }]} />
    <View style={[styles.content, { marginTop: - imageHeight * bgImageShowRatio }]}>
      <ImageBackground source={{ uri: FeedsIcon.welfareCardBg }} style={styles.contentBg} >
        <View style={styles.top}>
          { awardRecordList?.length > 0 ? <AwardRecordCarousel awardRecordList={awardRecordList} /> : <View /> }
          <WelfareCountDown remainTime={remainTime} onTimeEnd={() => setHeight(0)} />
        </View>
        <View style={styles.awardList}>
          { awardList.map((award, index) => (index === 0
            ? <Image style={styles.bigImage} source={{ uri: award.imageUrl }} key={index} />
            : (<View style={styles.award} key={index}>
              <Image style={styles.awardImage} source={{ uri: award.imageUrl }} />
              <ImageBackground source={{ uri: FeedsIcon.awardBtnBg }} style={styles.awardNameWrap}>
                <Text style={styles.awardName}>{award.name}</Text>
              </ImageBackground>
            </View>)
          ))}
        </View>
      </ImageBackground>
    </View>
  </View>);
};

export default React.forwardRef(NewUserWelfareCard);

