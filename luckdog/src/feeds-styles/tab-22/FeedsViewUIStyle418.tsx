/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  Text,
  View,
  Image,
  Animation,
  QBToastModule,
  AsyncStorage,
  QBAccountModule,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import FeedsReadLike from '../../framework/FeedsReadLike';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsViewItem from '../FeedsViewItem';
import { ConstantUtils } from '../common/utils';
import FeedsTraversal from '../../communication/FeedsTraversal';
import FeedsEventEmitter from '../../framework/FeedsEventEmitter';

import { FeedsUIStyle, FeedsTheme } from './components/utils';
import { reportUDS, strictExposeReporter, BusiKey, logError } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { TabId, CommonProps } from '../../entity';
import { SkinModelType } from '../../entity/skin';
import { getUserVisitor } from '@/luckbox';

const maleUrl = `${FeedsReadLike.baseurl}male.png`;
const femaleUrl = `${FeedsReadLike.baseurl}female.png`;
const bgUrl = `${FeedsReadLike.baseurl}${FeedsReadLike.bg}`;
const nightBgUrl = `${FeedsReadLike.baseurl}${FeedsReadLike.nightBg}`;


const maleMode = FeedsTheme.SkinColor.N5;
const femaleMode = FeedsTheme.SkinColor.N3;
const fontMode = ['#fff', '#A8A8A8', '#fff', '#A8A8A8'];
const titleMode = ['#333333', '#A8A8A8', '#333333', '#A8A8A8'];

const styles = StyleSheet.create({
  readLikeBox: {
    position: 'relative',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 9999,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 25,
    colors: titleMode,
    fontSize: FeedsUIStyle.T2_5,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  titleTip: {
    fontSize: FeedsUIStyle.T8,
    colors: titleMode,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  titleDesc: {
    fontSize: FeedsUIStyle.T1_5,
    colors: ['#666666'],
    marginBottom: 10,
  },
  genderWarp: {
    marginLeft: 30,
    marginRight: 30,
    flexDirection: 'column',
  },
  genderCommon: {
    width: 108,
    height: 108,
    flexDirection: 'column',
  },
  genderDesc: {
    fontSize: FeedsUIStyle.T2_5,
    colors: titleMode,
    marginTop: -10,
  },
  chooseItem: {
    fontSize: FeedsUIStyle.T1_5,
    fontFamily: 'PingFangSC-Regular',
  },
});

Image.prefetch(maleUrl);
Image.prefetch(femaleUrl);
Image.prefetch(bgUrl);

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle418 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 418;
  }
  public sBoxHide: any;
  public cBoxShow: any;
  public hasChoosedGender = false;
  public timer;
  public state = {
    likeArray: [] as any[],
    currentGenderArray: [],
    currentGenderIds: [],
    showPages: false,
    userId: '',
    gender: '',
    sWidth: ConstantUtils.getScreenWidth(), // 屏幕宽度
    sRatio: 750 / 570, // 背景
    hasClosed: false,
    hasChoose: false,
  };
  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle418');

  public async componentDidMount() {
    try {
      const { itemBean = {}, globalConf = {} } = this.props;
      const { curTabId = TabId.BOTTOM_RECOMM2 } = globalConf;
      let qbid = getUserVisitor().getQBID();
      if (!qbid) {
        const info = await QBAccountModule.getAccountInfo();
        ({ qbid } = info);
      }
      this.setState({
        userId: qbid,
      }, () => {
        Image.prefetch(maleUrl);
        Image.prefetch(femaleUrl);
        Image.prefetch(bgUrl);
      });
      const res = await AsyncStorage.getItem('currentPagesCloseNewReadLikeTime');
      let { userId } = this.state;
      if (userId === '') userId = 'noUserInfo';
      let obj = res;
      if (!obj) obj = '{}';
      obj = JSON.parse(obj);
      if (!obj[userId]) obj[userId] = 0;
      if (parseInt(obj[userId], 10) < 3) {
        this.setState({
          showPages: true,
        });
      }

      const { showPages } = this.state;
      if (showPages) {
        reportUDS(BusiKey.EXPOSE__CARD, { itemBean, tabId: curTabId });
      }
    } catch (err) {
      logError(err, 'FeedsViewUIStyle418.componentDidMount');
    }
  }

  public UNSAFE_componentWillMount() {
    this.sBoxHide = new Animation({
      startValue: 1,
      toValue: 0,
      duration: 500,
      delay: 0,
      mode: 'timing',
      timingFunction: 'linear',
    });
    this.cBoxShow = new Animation({
      startValue: 0,
      toValue: 1,
      duration: 600,
      delay: 600,
      mode: 'timing',
      timingFunction: 'linear',
    });
    this.hasChoosedGender = false;
  }

  public componentWillUnmount() {
    this.sBoxHide?.destroy();
    this.cBoxShow?.destroy();
  }

  // 设置 选好了
  public setChoose = (type = true) => {
    const { likeArray, currentGenderArray, currentGenderIds, hasChoose } = this.state;
    const { itemBean = {}, globalConf = {} } = this.props;
    const info = {};
    if (likeArray.length <= 0 || hasChoose) return;
    this.setState({ hasChoose: true });
    // 阅读喜好卡片选好了点击
    let reportStr = '';
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < likeArray.length; i++) {
      const idx = likeArray[i];
      info[currentGenderIds[idx]] = currentGenderArray[idx];
      reportStr += `${currentGenderIds[idx]}_`;
    }
    const obj = {
      func: 'setProfile',
      SContent: info,
    };

    FeedsTraversal.traversal(itemBean.tab_id, itemBean.business, obj, globalConf).then((res) => {
      if (res.success) {
        reportUDS(BusiKey.CLICK__INTEREST_OK, this.props, { ext_data1: reportStr });
        if (type) QBToastModule.show('设置成功', '', 1500);
        this.setState({
          showPages: false,
        });
        FeedsEventEmitter.sendEventToList(itemBean.symbolKey, FeedsEventEmitter.event.refresh, {
          message: '设置成功',
        });
      } else {
        this.setState({ hasChoose: false, hasClosed: false });
        QBToastModule.show('网络错误,请稍后重试', '', 1500);
      }
    });
  };

  public chooseGender = (gender) => {
    const { itemBean = {}, globalConf = {} } = this.props;
    let currentGenderArray: string[] = [];
    let currentGenderIds: string[] = [];
    const info = {};
    const { maleIndex, femaleIndex } = FeedsReadLike;

    if (gender === 'male') {
      currentGenderArray = FeedsReadLike.list.male;
      currentGenderIds = FeedsReadLike.ids.male;
      info[maleIndex] = '男生';
      reportUDS(BusiKey.CLICK__INTEREST_BOY, this.props);
    } else {
      currentGenderArray = FeedsReadLike.list.female;
      currentGenderIds = FeedsReadLike.ids.female;
      info[femaleIndex] = '女生';
      reportUDS(BusiKey.CLICK__INTEREST_GIRL, this.props);
    }
    const obj = {
      func: 'setProfile',
      SContent: info,
    };
    this.timer = setTimeout(() => {
      this.setState({
        gender,
        currentGenderArray,
        currentGenderIds,
      }, () => {
        clearTimeout(this.timer);
        this.timer = null;
        this.sBoxHide?.destroy();
      });
    }, 500);
    this.sBoxHide.start();
    this.cBoxShow.start();

    FeedsTraversal.traversal(itemBean.tab_id, itemBean.business, obj, globalConf).then((res) => {
      if (!res.success) {
        logError('418 chooseGender failed', 'FeedsViewUIStyle418.chooseGender');
      } else {
        this.hasChoosedGender = true;
      }
    });
  };

  // 选中tab
  public chooseLike = (i) => {
    const { likeArray } = this.state;
    const { currentGenderIds } = this.state;
    let newLikeArray = likeArray.slice(0);

    if (likeArray.indexOf(i) < 0) {
      newLikeArray.push(i);
    } else {
      newLikeArray = newLikeArray.filter(x => x !== i);
    }
    const id = currentGenderIds[i];
    reportUDS(BusiKey.CLICK__INTEREST_CATEGORY, this.props, { ext_data1: id });
    this.setState({
      likeArray: newLikeArray,
    });
  };

  public close = async () => {
    const { itemBean = {} } = this.props;
    const { likeArray = [], hasClosed = false } = this.state;
    if (hasClosed) return;
    reportUDS(BusiKey.CLICK__INTEREST_CLOSE, this.props);
    this.setState({ hasClosed: true });
    if (likeArray.length === 0) {
      try {
        if (this.hasChoosedGender) {
          this.setState({
            showPages: false,
          });
          FeedsEventEmitter.sendEventToList(itemBean.symbolKey, FeedsEventEmitter.event.refresh, {
            message: '设置成功',
          });
        }
        const res = await AsyncStorage.getItem('currentPagesCloseNewReadLikeTime');
        let { userId } = this.state;
        if (userId === '') userId = 'noUserInfo';
        let obj = res;
        if (!obj) obj = '{}';
        obj = JSON.parse(obj);
        if (!obj[userId]) obj[userId] = 0;
        // 点击关闭超过3次不再出现该卡片
        if (parseInt(obj[userId], 10) < 3) {
          this.setState({
            showPages: false,
          });
          obj[userId] = parseInt(obj[userId], 10) + 1;
          AsyncStorage.setItem('currentPagesCloseNewReadLikeTime', JSON.stringify(obj));
        }
      } catch (err) {
        logError(err, 'FeedsViewUIStyle418.closeCard');
      }
    } else {
      this.setChoose(false);
    }
  };

  public renderBanner = (sWidth, sHeight) => {
    const { itemBean = {} } = this.props;
    const { gender = '', likeArray = [], currentGenderArray = [] } = this.state;
    const ratio = 750 / 693;
    const chooseWidth = sWidth / ratio;
    const btnRatio = 750 / 398;
    const btnWidth = sWidth / btnRatio;
    const btnHRatio = 398 / 72;
    const btnHeight = btnWidth / btnHRatio;
    let btnOpacity = 0;
    if (currentGenderArray.length >= 1) {
      btnOpacity = likeArray.length === 0 ? 0.45 : 1;
    }
    return (<View
      style={
        {
          width: sWidth,
          height: sHeight,
          position: 'relative',
        }
      }
    >
      <View
        key={'view1'}
        style={
          {
            opacity: this.sBoxHide,
            display: gender === '' ? 'flex' : 'none',
          }
        }
      >
        <View style={[styles.center, { marginTop: 40 }]}>
          <View style={styles.center}>
            <Text style={styles.titleTip}>你喜欢什么小说?</Text>
            <Text style={styles.titleDesc}>根据你的选择，为你推荐最合适的小说</Text>
          </View>
        </View>
        <View
          style={[styles.center, { width: sWidth, flexDirection: 'row' }]}
        >
          <View
            onClick={() => this.chooseGender('male')}
            style={[styles.center, styles.genderWarp]}>
            <Image
              style={
                styles.genderCommon
              }
              source={{ uri: maleUrl }}
              reportData={{ sourceFrom: itemBean.item_id }}
              accessibilityLabel="男生头像"
            />
            <Text style={styles.genderDesc}>男生小说</Text>
          </View>
          <View
            onClick={() => this.chooseGender('female')}
            style={[styles.center, styles.genderWarp]}>
            <Image
              style={
                styles.genderCommon
              }
              source={{ uri: femaleUrl }}
              reportData={{ sourceFrom: itemBean.item_id }}
              accessibilityLabel="男生头像"
            />
            <Text style={styles.genderDesc}>女生小说</Text>
          </View>
        </View>
      </View>
      <View
        key={'view2'}
        style={
          {
            width: sWidth,
            height: sHeight,
            opacity: this.cBoxShow,
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
          }
        }
      >
        <Text
          style={[{
            width: chooseWidth,
            marginLeft: 5,
            opacity: currentGenderArray.length > 0 ? 1 : 0,
          },
          styles.title,
          ]}
        >
          选择阅读喜好
        </Text>
        <View
          style={
            [
              styles.center,
              {
                width: sWidth,
                flexDirection: 'row',
                marginBottom: 21,
              }]
          }
        >
          {this.renderChoose(sWidth)}
        </View>
        <View
          onClick={this.setChoose}
          style={
            [
              styles.center,
              {
                width: btnWidth,
                height: btnHeight,
                borderRadius: btnHeight / 2,
                opacity: btnOpacity,
                backgroundColors: gender === 'male' ? maleMode : femaleMode,
              }]
          }
        >
          <Text
            style={
              {
                fontSize: FeedsUIStyle.T2,
                colors: fontMode,
              }
            }
          >选好了</Text>
        </View>
      </View>
    </View>);
  };

  public renderChoose = (sWidth) => {
    const { currentGenderArray, gender = '', likeArray = [] } = this.state;
    const wRatio = 750 / 210;
    const hRatio = 210 / 60;
    const chooseWidth = sWidth / wRatio;
    const chooseHeight = chooseWidth / hRatio;
    const ratio = 750 / 700;
    const width = sWidth / ratio;
    const marginRatio = 210 / 11;
    const margin = chooseWidth / marginRatio;
    const selectUrl = FeedsReadLike.normalChoose;
    const selectRatio = 750 / 20;
    const selectWidth = sWidth / selectRatio;
    const selectHeight = (selectWidth / 20) * 14;

    return (<View
      style={
        {
          justifyContent: 'flex-start',
          flexDirection: 'row',
          flexWrap: 'wrap',
          width,
        }
      }
    >
      {
        currentGenderArray.map((i, idx) => {
          const isSelected = likeArray.indexOf(idx) < 0;
          return (<View
            key={i}
            style={
              [
                styles.center,
                {
                  width: chooseWidth,
                  position: 'relative',
                  height: chooseHeight,
                  marginRight: margin,
                  marginLeft: margin,
                  marginTop: 5,
                  marginBottom: 5,
                  borderWidth: .5,
                  borderRadius: chooseHeight / 2,
                  borderColors: gender === 'male' ? maleMode : femaleMode,
                },
                isSelected
                  ? null
                  : {
                    backgroundColors: gender === 'male' ? maleMode : femaleMode,
                    colors: ['#fff'],
                  },
              ]
            }
            onClick={() => this.chooseLike(idx)}
          >
            {
              !isSelected
                ? <Image
                  style={
                    {
                      height: selectHeight,
                      width: selectWidth,
                      position: 'absolute',
                      top: (chooseHeight / 2) - (selectHeight / 2),
                      left: (chooseWidth / 210) * 46,
                    }
                  }
                  source={{ uri: selectUrl }}
                  accessibilityLabel="男频头像"
                /> : null
            }
            <Text
              style={[
                isSelected
                  ? {
                    colors: gender === 'male' ? maleMode : femaleMode,
                  }
                  : {
                    colors: fontMode,
                  },
                styles.chooseItem,
              ]
              }
            >{`${i}`}</Text>
          </View>);
        })
      }
    </View>);
  };

  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle418');
    const skinId = FeedsTheme.returnSkinId();
    const { itemBean = {} } = this.props;
    const { showPages } = this.state;
    // 背景宽高
    if (!showPages) {
      return null;
    }
    const mode = !(skinId === SkinModelType.NIGHT || skinId === SkinModelType.DARK);
    const { sWidth = 0, sRatio = 1 } = this.state;
    const sHeight = Math.floor(sWidth / sRatio);
    const url = mode ? bgUrl : nightBgUrl;

    return (
      <View
        style={[
          styles.readLikeBox,
          {
            height: sHeight,
            width: sWidth,
          },
        ]}
        onLayout={this.onLayout}
      >
        <Image
          style={
            [{
              height: sHeight,
              width: sWidth,
            }, styles.bg,
            ]
          }
          key={'bg'}
          source={{ uri: url }}
          reportData={{ sourceFrom: itemBean.item_id }}
          accessibilityLabel="阅读喜好背景"
        />
        <View
          style={styles.close}
          key={'close'}
          onClick={this.close}
        ></View>
        {this.renderBanner(sWidth, sHeight)}
      </View>
    );
  }
}
