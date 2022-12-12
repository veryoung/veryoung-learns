import React from 'react';
import { View, Image, Text, Modal, StyleSheet } from '@tencent/hippy-react-qb';

import { getWidthHeight } from '@/framework/utils/device';

import { TreasureContext } from '../types';
import source from '@/framework/FeedsIcon';
import FeedsTheme from '@/framework/FeedsTheme';
import FeedsConst from '@/framework/FeedsConst';

interface Props {
  context: TreasureContext;
  onClick: (context: TreasureContext, isConfirm: boolean) => any;
}

const IMAGES = source.welfareTreasure;

export const WeakModal = (props: Props) => {
  const { context, onClick } = props;
  const { state: { isWeakModalShow, rewardNum, powerRewardMax } } = context;

  if (!isWeakModalShow || !FeedsConst.getGlobalConfKV('initActive')) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => onClick(context, false)}
      supportedOrientations={['portrait']}
    >
      <View style={styles.mask}>
        <View style={styles.wrapper}>
          <View style={styles.modal}>
            <Text style={styles.title}>恭喜你</Text>
            <View style={styles.tip}>
              <Text style={styles.label}>获得</Text>
              <Text style={styles.strong}>{rewardNum}</Text>
              <Text style={styles.label}>金币</Text>
            </View>
            <Image
              style={styles.image}
              source={IMAGES.modalImg}
              noPicMode={{ enable: false }}
            />
            <View style={styles.button}>
              <Image
                style={styles.buttonBg}
                source={IMAGES.modalBtn}
                noPicMode={{ enable: false }}
              />
              <Text style={styles.buttonText} onClick={() => onClick(context, true)}>
                {powerRewardMax ? `看视频再领最高${powerRewardMax}金币` : '稍后再来'}
              </Text>
            </View>
          </View>
          <Image
            style={styles.close}
            source={IMAGES.modalClose}
            onClick={() => onClick(context, false)}
            noPicMode={{ enable: false }}
            // nightMode={{ enable: isAndroid }}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  wrapper: {
    width: getWidthHeight().width,
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    alignItems: 'center',
    width: 266,
    height: 294.5,
    backgroundColors: FeedsTheme.SkinColor.A5,
    borderRadius: 16,
  },
  title: {
    height: 24,
    marginTop: 28,
    fontFamily: 'PingFangSC-Medium',
    fontSize: 20,
    colors: FeedsTheme.SkinColor.B5,
    textAlign: 'center',
    lineHeight: 24,
  },
  tip: {
    height: 21,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 14,
    colors: FeedsTheme.SkinColor.A2,
  },
  strong: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 14,
    colors: FeedsTheme.SkinColor.B5,
  },
  image: {
    width: 176,
    height: 104,
    marginTop: 26,
  },
  button: {
    position: 'relative',
    width: 228,
    height: 44,
    marginTop: 16,
  },
  buttonBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 228,
    height: 44,
  },
  buttonText: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 228,
    height: 44,
    lineHeight: 44,
    fontFamily: 'PingFangSC-Medium',
    fontSize: 17,
    color: '#613610',
    textAlign: 'center',
  },
  close: {
    width: 30,
    height: 30,
    opacity: 0.8,
    marginTop: 28,
  },
});
