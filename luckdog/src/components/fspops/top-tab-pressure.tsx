import React, { useEffect, useState } from 'react';
import { View, Modal, Image, StyleSheet } from '@tencent/hippy-react-qb';
import { ConstantUtils } from '../../feeds-styles/common/utils';
import { FSOpContentItem } from '@/presenters';
import { FullScreenPopData, ItemBean } from '../../entity';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { fadeIn } from '../animationStyle';
import { getDeviceVisitor } from '@/luckbox';
import { reportUDS, BusiKey, logError } from '@/luckdog';

/** 屏幕宽度 */
const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
/** 图片比例 */
const IMG_RATIO = 687 / 1191;
/** 图片宽度 */
const IMG_WIDTH = SCREEN_WIDTH * (458 / 750);
/** 压屏曝光次数 */
const TOP_TAB_TIME_KEY = 'TopTabPressureTime';
/** 最大曝光次数 */
const MAX_TIMES = 1;


type Props = {
  // 全局配置
  globalConf: any;
  // 关闭弹窗
  onClose: () => void;
  /** 下发的图片 */
  opData?: FSOpContentItem ;
};

export type Ref = HTMLDivElement;

/** 模块关键字 */
const TOP_TAB_PRESSURE = 'TopTabPressure';
const fadeInAnim = fadeIn(1000); // 图片淡入
let isExposed = false;

/** 上报曝光 */
const reportExpose = (itemBean?: ItemBean): void => {
  if (isExposed) return;
  reportUDS(BusiKey.EXPOSE__TOP_TAB_GUIDE_POP, { itemBean });
  isExposed = true;
};

const imgLoaded = () => {
  fadeInAnim.start();
};

export const TopTabPressure = (props: Props): JSX.Element => {
  const { opData } = props;

  const [canShow, setCanShow] = useState(false);
  if (canShow) reportExpose(opData?.itemBean);

  const [showTime, setShowTime] = useState(0);
  if (!opData || !opData.opInfo) return <View/>;
  const { picUrl } = opData.opInfo as FullScreenPopData;
  useEffect(() => {
    Image.prefetch(picUrl);
    const checkShowed = async () => {
      try {
        const { opData } = props;
        const cacheTime = await readSharedSettings(TOP_TAB_TIME_KEY) || '0';
        const times = parseInt(cacheTime, 10);
        const isOverTime = times >= (opData?.showTimes || MAX_TIMES);
        if (!canShow && !isOverTime) {
          setShowTime(times);
          setCanShow(true);
        }
      } catch (err) {
        logError(err, TOP_TAB_PRESSURE);
      }
    };
    checkShowed();
  }, []);

  /** 关闭弹窗 */
  const closeModal = () => {
    const { onClose } = props;
    // 记录关闭次数
    writeSharedSettings(TOP_TAB_TIME_KEY, showTime + 1);
    fadeInAnim.destroy();
    reportUDS(BusiKey.CLICK__TOP_TAB_GUIDE_POP, { itemBean: opData.itemBean });
    onClose();
  };

  return <Modal
    transparent
    onRequestClose={closeModal}
    supportedOrientations={['portrait']}
    visible={canShow}
    specialHost={true}
  >
    <View style={styles.mask} onClick={closeModal} >
    </View>
    <View
      style={[styles.container]}
      onLayout={imgLoaded}
    >
      <Image
        style={[styles.img, {
          opacity: canShow ? fadeInAnim : 0,
        }]}
        source={picUrl}
        noPicMode={{ enable: false }}
        reportData={{ sourceFrom: TOP_TAB_PRESSURE }}
      />
    </View>
  </Modal>;
};

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColors: ['rgba(0,0,0,0.8)'],
    positon: 'relative',
  },
  container: {
    position: 'absolute',
    bottom: getDeviceVisitor().isAdr() ? 26 : 6,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColors: ['transparent'],
    width: SCREEN_WIDTH,
  },
  img: {
    width: IMG_WIDTH,
    height: IMG_WIDTH / IMG_RATIO,
  },
});
