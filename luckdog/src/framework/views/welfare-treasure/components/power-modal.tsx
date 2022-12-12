import React from 'react';
import { View, Image, Text, Modal, StyleSheet } from '@tencent/hippy-react-qb';

import { getWidthHeight, isIOS } from '@/framework/utils/device';

import { TreasureContext } from '../types';
import source from '@/framework/FeedsIcon';
import { getDeviceVisitor } from '@/luckbox';
import FeedsTheme from '@/framework/FeedsTheme';
import { SkinModelType } from '@/entity';
import FeedsConst from '@/framework/FeedsConst';

interface Props {
  context: TreasureContext;
  onClick: (context: TreasureContext, isConfirm: boolean) => any;
}

const IMAGES = source.welfareTreasure;

const Z_INDEX_1 = 1;
const Z_INDEX_2 = 2;
const Z_INDEX_3 = 3;
const Z_INDEX_4 = 4;
const WELFARE_PACKET_BTN_BG = ['rgba(255,222,165,1)', isIOS ? 'rgba(255,222,165,1)' : 'rgba(172,144,102,1)'];
const WELFARE_PACKET_BTN_TEXT = ['rgba(97,54,16,1)', 'rgba(97,54,16,1)'];
const WELFARE_AWARD_LABEL_BG = ['rgba(232,174,112,1)', isIOS ? 'rgba(232,174,112,1)' : 'rgba(172,144,102,1)'];
const WELFARE_AWARD_LABEL_TEXT = ['rgba(97,54,16,1)', isIOS ? 'rgba(97,54,16,1)' : 'rgba(97,54,16,0.5)'];
const WELFARE_AWARD_NUM_TEXT = ['rgba(254,222,163,1)', isIOS ? 'rgba(254,222,163,1)' : 'rgba(254,222,163,0.5)'];
const WELFARE_AWARD_LABEL_BORDER = ['rgba(255,255,255,1)', isIOS ? 'rgba(255,255,255,1)' : 'rgba(97,54,16,1)'];
const isAndroid = getDeviceVisitor().isAdr();

export const PowerModal = (props: Props) => {
  const { context, onClick } = props;
  const { state: { isPowerModalShow, powerRewardNum, powerModalCountdown } } = context;

  if (!isPowerModalShow || !FeedsConst.getGlobalConfKV('initActive')) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => onClick(context, false)}
      supportedOrientations={['portrait']}
    >
      <View style={styles.mask}>
        {FeedsTheme.returnSkinId() === SkinModelType.NIGHT && isIOS && <View style={styles.wrapperMask}></View>}
        <View style={styles.wrapper}>
          {/* 光效 */}
          <Image
            style={styles.lightBg}
            source={IMAGES.light}
            noPicMode={{ enable: false }}
            nightMode={{ enable: isAndroid }}
          />
          {/* 奖励 */}
          <View style={styles.awardWrap}>
            {/* 架子背景 */}
            <Image
              style={styles.awardBg}
              source={IMAGES.awardBg}
              noPicMode={{ enable: false }}
              nightMode={{ enable: isAndroid }}
            />
            <Text style={styles.welfareNum}>x1</Text>
            {/* 奖励列表 */}
            <View style={styles.awardList}>
              <View style={styles.awardItem}>
                <Image
                  style={[styles.awardIcon, styles.awardIconLg]}
                  source={IMAGES.coin}
                  noPicMode={{ enable: false }}
                  nightMode={{ enable: isAndroid }}
                />
                <Image
                  style={[styles.shadowIcon, styles.shadowIconLg]}
                  source={IMAGES.shadow}
                  noPicMode={{ enable: false }}
                  nightMode={{ enable: isAndroid }}
                />
                <View style={[styles.labelWrap, styles.labelWrapLg]}>
                  <Text style={[styles.labelText, styles.labelTextLg]}>{powerRewardNum}金币</Text>
                </View>
              </View>
            </View>
          </View>
          {/* 知道了 按钮 */}
          <View style={styles.btnWrap}>
            <Text style={styles.btnText} onClick={() => onClick(context, true)}>我知道了({powerModalCountdown}秒)</Text>
          </View>
          {/* 关闭 icon */}
          <Image
            style={styles.closeIcon}
            source={IMAGES.modalClose}
            onClick={() => onClick(context, false)}
            noPicMode={{ enable: false }}
            nightMode={{ enable: isAndroid }}
          />
        </View>
      </View>
    </Modal>
  );
};

// css
const styles = StyleSheet.create({
  mask: {
    width: getWidthHeight().width,
    height: getWidthHeight().height,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  wrapper: {
    width: getWidthHeight().width,
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperMask: {
    width: getWidthHeight().width,
    height: getWidthHeight().height,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: Z_INDEX_4,
  },
  lightBg: {
    position: 'absolute',
    width: getWidthHeight().width,
    height: getWidthHeight().width,
  },
  awardWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  awardBg: {
    width: (660 / 750) * getWidthHeight().width,
    height: (510 / 750) * getWidthHeight().width,
  },
  awardList: {
    position: 'absolute',
    bottom: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  awardItem: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  awardIcon: {
    position: 'relative',
    zIndex: Z_INDEX_2,
  },
  awardIconLg: {
    width: 140,
    height: 140,
  },
  shadowIcon: {
    position: 'absolute',
    zIndex: Z_INDEX_1,
    bottom: -3,
  },
  shadowIconLg: {
    width: 120,
    height: 36,
  },
  btnWrap: {
    height: 44,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColors: WELFARE_PACKET_BTN_BG,
    marginBottom: 31,
    marginTop: -30,
    paddingHorizontal: 24,
  },
  btnText: {
    colors: WELFARE_PACKET_BTN_TEXT,
    fontSize: 17,
  },
  closeIcon: {
    width: 30,
    height: 30,
  },
  labelWrap: {
    position: 'absolute',
    backgroundColors: WELFARE_AWARD_LABEL_BG,
    paddingLeft: 8,
    paddingRight: 8,
    borderWidth: 1,
    borderColors: WELFARE_AWARD_LABEL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX_3,
  },
  labelWrapLg: {
    height: 20,
    borderRadius: 20,
    top: 10,
    right: 12,
  },
  labelText: {
    colors: WELFARE_AWARD_LABEL_TEXT,
    fontWeight: 'bold',
  },
  labelTextLg: {
    fontSize: 12,
  },
  welfareNum: {
    position: 'absolute',
    top: 18,
    left: 255,
    fontSize: 24,
    colors: WELFARE_AWARD_NUM_TEXT,
    zIndex: Z_INDEX_3,
  },
});
