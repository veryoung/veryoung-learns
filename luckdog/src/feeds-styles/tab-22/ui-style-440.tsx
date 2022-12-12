/**
 * 书架更新提示卡片
 */

import React, { ForwardRefRenderFunction, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from '@tencent/hippy-react-qb';
import { ViewRef } from '@/entity/common';
import { safeJsonParse } from '../common/utils';
import { addKeylink, reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { FeedsUIStyle } from '../../framework/FeedsConst';
import FeedsTheme from '../../framework/FeedsTheme';
import { getRedDotPresenter } from '@/presenters';
import FeedsUtils from '../../framework/FeedsUtils';
import { emitter, events } from '../../utils/emitter';

const TAG = 'ui-style-440';

type Props = {
  itemBean: {
    parsedObject: {
      sData: string;
    }
  },
  index: number;
};

/** 更新的书籍信息结构 */
interface UpdatedBookInfo {
  /** 书籍封面 */
  picUrl: string;
}

interface UpdatedBookData {
  /** 更新的书籍信息 */
  updatedBookInfos: UpdatedBookInfo[];
  /** 提示的文案信息 */
  tipText: string;
  /** 更新的书籍数量 */
  updatedBookNum: number;
  /** 跳转地址 */
  jumpUrl: string;
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    borderRadius: 50,
  },
  tipText: {
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N3,
    marginLeft: 4,
  },
  imageContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 15,
    height: 20,
    borderRadius: 2,
    marginRight: 4,
  },
});

const onLayout = (event: Record<string, any>, cardIndex: number): void => {
  strictExposeReporter.addExpoItem({
    cardIndex,
    rect: event.layout,
  });
};

/** 控制tip的初始化和展示 */
const useTipShow = (props: Props) => {
  const [isInit, setIsInit] = useState(false);
  const [enableShow, setEnableShow] = useState(true);

  useEffect(() => {
    getRedDotPresenter().getRedDotConfig()
      .then((redDotConfig) => {
        if (redDotConfig.updateNum > 0) {
          addKeylink('updateNum > 0, data is ready', TAG);
          setIsInit(true);
        }
      });

    const handleCancel = () => {
      setEnableShow(false);
    };

    // 红点被消费后不再展示
    emitter.on(events.RED_DOT_CANCELED, handleCancel);

    return () => emitter.off(events.RED_DOT_CANCELED, handleCancel);
  }, []);

  const onClick = (url) => {
    FeedsUtils.doLoadUrl(url);
    setEnableShow(false);
    reportUDS(BusiKey.CLICK__CARD, props);
  };

  return { isInit, enableShow, onClick };
};

const ImagesView = ({ picUrls }: { picUrls: string[] }) => (
  <>
    {picUrls.map((picUrl, idx) => (<Image source={{ uri: picUrl }} key={idx} style={styles.image}/>))}
  </>
);

const UpdatedBookTip: ForwardRefRenderFunction<ViewRef, Props> = (
  props,
  ref: React.Ref<ViewRef>,
): JSX.Element | null => {
  const { updatedBookInfos = [], tipText, jumpUrl } = safeJsonParse<UpdatedBookData>(props.itemBean.parsedObject.sData);

  const { enableShow, isInit, onClick } = useTipShow(props);

  // 没有数据，不做渲染
  if (!updatedBookInfos.length) {
    addKeylink('updatedBookInfos is empty', TAG);
    return null;
  }
  // 还没初始化好，不做渲染
  if (!isInit) {
    addKeylink('component is not prepared', TAG);
    return null;
  }
  // 不允许展示，不做渲染
  if (!enableShow) {
    addKeylink('component is not allowed to show', TAG);
    return null;
  }

  const picUrls = updatedBookInfos.map(info => info.picUrl);

  return (
    <View
      ref={ref}
      onLayout={event => onLayout(event, props.index)}
      style={[styles.wrap]}
    >
      <View style={styles.tipContainer} onClick={() => onClick(jumpUrl)}>
        <View style={styles.imageContainer}>
          <ImagesView picUrls={picUrls}/>
        </View>
        <Text style={styles.tipText}>{tipText}</Text>
      </View>
    </View>
  );
};

export default React.forwardRef(UpdatedBookTip);
