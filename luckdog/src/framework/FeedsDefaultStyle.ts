import { StyleSheet } from '@tencent/hippy-react-qb';
import { CardRadius } from './FeedsConst';

export const DEFAULT_FEEDS_STYLE = {
  version: 1,
  minRNVersion: 8150,
  data: {
    '*': {
      container: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 12,
        paddingBottom: 12,
      },
      containerTopPaddingTop: 8,
      img: {
        space: 1,
        borderRadius: 6,
        leftImage: {
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 0,
        },
        middleImage: {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        rightImage: {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 4,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 4,
        },
      },
      title: {
        fontWeight: 'normal',
      },
      titleColors: {
        NORMAL: ['#242424', '#686d74', '#242424', 'white'], // FeedsTheme.SkinColor.A1
        CLICKED: ['#666666', '#50555c', '#24242480', '#ffffff80'], // FeedsTheme.SkinColor.A2
        BG_NORMAL: ['#242424', '#686d74', '#242424', '#242424'],
        BG_CLICKED: ['#666666', '#686d74', '#666666', '#666666'],
      },
      // 背景图模式卡片的背景颜色设置
      bgModeBackgroundColors: ['transparent', '#181b1f', 'transparent', 'transparent'],
      SPLITTER: {
        NONE: {
          height: 0,
        },
        THIN: {
          height: 0.5,
          marginLeft: 12,
          marginRight: 12,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        },
        THIN_MATCH_PARENT: {
          height: 0.5,
          marginLeft: 12,
          marginRight: 12,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        },
        BOLD: {
          height: 0.5,
          marginLeft: 0,
          marginRight: 0,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        },
        WHITE_BOLD: {
          height: 0.5,
          marginLeft: 0,
          marginRight: 0,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        },
        NEW_BOLD: {
          height: 0.5,
          marginLeft: 0,
          marginRight: 0,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        },
        NORMAL: {
          height: 0.5,
          marginLeft: 12,
          marginRight: 12,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        },
      },
    },
    tabList: StyleSheet.create({
      wrap: {
        flex: 1,
        flexDirection: 'column',
      },
      triangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
      },
      welfare_wrap: {
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 16,
      },
      shadow: {
        position: 'absolute',
        top: 0,
        tintColors: ['white', '#202429', '#fffffff2', '#000000f2'],
      },
      navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColors: ['transparent'],
        overflow: 'visible',
      },
      itemText: {
        textAlign: 'center',
        textAlignVertical: 'center',
        // marginTop: 2,
        colors: ['#242424', '#686d74', '#242424', 'white'], // A1
        fontSize: 16, // tab 普通非焦点文字大小
        fontWeight: 'normal',
        opacity: 0.8,
      },
      focusView: {
        paddingBottom: -1,
      },
      focusText: {
        marginTop: -2,
        // paddingBottom: 4,
        fontSize: 21, // tab 焦点文字大小
        fontWeight: 'bold',
        opacity: 1,
      },
    }),
    extTabList: StyleSheet.create({
      redDotBg: {
        position: 'absolute',
        top: 0,
        right: 13,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColors: ['white', '#23282d', '#eeeeee', '#333333'],
        // 日间夜间可以指定颜色处理，深色浅色不知道皮肤颜色所以无法盖住
      },
      redDotCnt: {
        height: 21,
        borderRadius: 10.5,
        backgroundColors: ['#FA7270', '#764143', '#FA7270', '#FA7270'],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColors: ['white', '#7f8386', 'white', 'white'], // A5
      },
      redDotCntContent: {
        marginLeft: 6,
      },
      redEllipsis: {
        width: 8,
        height: 2,
      },
      redNum: {
        fontSize: 13,
        colors: ['white', '#7f8386', 'white', 'white'], // A5
        textAlign: 'center',
      },
      redArrow: {
        width: 6,
        height: 10,
        marginRight: 4,
      },
      redDot: {
        position: 'absolute',
        height: 15,
        borderRadius: 7.5,
        backgroundColors: ['#FA7270', '#764143', '#FA7270', '#FA7270'],
        top: 3,
        right: -5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColors: ['white', '#7f8386', 'white', 'white'], // A5
      },
      redDotNum: {
        fontSize: 11,
        colors: ['white', '#7f8386', 'white', 'white'], // A5
      },
      leftShadow: {
        position: 'absolute',
        left: 0,
        width: 6,
        height: 40,
        tintColors: ['white', '#23282d', '#ffffff20', '#00000010'], // D5
      },
      rightShadow: {
        position: 'absolute',
        width: 12,
        height: 40,
        tintColors: ['white', '#23282d', '#ffffff20', '#00000010'], // D5
      },
      edit: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColors: ['white', '#00000000', '#ffffffbf', '#0000007f'],
      },
      iconsCustom: {
        width: 21,
        height: 21,
        marginLeft: 1,
        marginRight: 13,
        tintColors: ['#666666', '#50555c', '#24242480', '#ffffff80'], // A2
      },
      image: {
        width: 35,
        height: 20,
        resizeMode: 'contain',
        opacity: 0.8,
        // borderColors: ['red'],
        // borderWidth: 0.5,
      },
      focusImage: {
        width: 44,
        height: 26,
        marginTop: 6.5,
        marginBottom: 11.5,
        resizeMode: 'contain',
        opacity: 1,
        // borderColors: ['red'],
        // borderWidth: 0.5,
      },
      specialImage: {
        height: 40,
        resizeMode: 'contain',
        backgroundColors: ['transparent', 'transparent', 'transparent', 'transparent'],
      },
      specialFocusImage: {
        marginTop: -1,
        height: 40,
        resizeMode: 'contain',
        backgroundColors: ['transparent', 'transparent', 'transparent', 'transparent'],
      },
      tipsBg: {
        resizeMode: 'stretch',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      tipsText: {
        fontSize: 14, // T2,
        colors: ['white', '#7f8386', '#ffffff20', 'white'], // A5
        textAlign: 'center',
        marginTop: 4,
        marginHorizontal: 4,
      },
      showNewTabs: {
        position: 'absolute',
        right: 4.5,
        top: 28,
        width: 49,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
      },
      newTabTags: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
      },
      tabTitle: {
        fontSize: 9,
        textAlignVertical: 'center',
        textAlign: 'center',
        colors: ['white', '#7f8386', '#ffffff20', 'white'], // A5
        paddingTop: 2,
      },
      tips: {
        position: 'absolute',
        left: 10,
        top: 32,
        width: 131,
        alignItems: 'center',
        justifyContent: 'center',
        height: 32,
      },
      highlightBubble: {
        position: 'absolute',
        left: 10,
        top: 32,
        height: 35,
        justifyContent: 'flex-end',
      },
      triangle: {
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 7,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColors: ['#000000cc', '#000000cc', '#000000cc', '#000000cc'],
        position: 'absolute',
        top: 0,
        left: 12,
      },
      tipsTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 28,
        backgroundColors: ['#000000cc', '#000000cc', '#000000cc', '#000000cc'],
        paddingHorizontal: 4,
        borderRadius: 2,
      },
      refreshTipsEnter: {
        position: 'absolute',
        bottom: 0,
        width: 62,
        height: 62,
        zIndex: 9999,
      },
      leftPosition: {
        left: 6,
      },
      rightPosition: {
        right: 6,
      },
      lottieBall: {
        position: 'absolute',
        bottom: 0,
        width: 202,
        height: 64,
        zIndex: 9999,
      },
      pageTurningTips: {
        width: 182,
        height: 54,
        position: 'absolute',
        right: 0,
        top: 4,
      },
      refreshTipsBG: {
        width: 62,
        height: 62,
      },
      refreshTipsEnterImg: {
        width: 25,
        height: 25,
        zIndex: 1,
        marginTop: 18.5,
        marginLeft: 18.5,
        position: 'absolute',
      },
      lottieBallData: {
        width: 165,
        height: 76,
        position: 'absolute',
        bottom: -10,
        right: -6,
      },
      refreshTipsEnterImg_arrow_0: {
        width: 18,
        height: 9,
        zIndex: 1,
        marginTop: 22,
        marginLeft: 21.5,
      },
      refreshTipsEnterImg_arrow_1: {
        width: 18,
        height: 9,
        zIndex: 1,
        marginTop: 0,
        marginLeft: 21.5,
      },
      preloadLottie: {
        position: 'absolute',
        width: 10,
        height: 10,
        bottom: 100,
        left: 0,
        opacity: 0,
      },
      resetAnimation: {
        transform: [
          {
            rotate: '0deg',
          },
        ],
      },
      line: {
        position: 'absolute',
        left: 0,
        top: 44,
        backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
        height: 0,
      },
    }),
    23: StyleSheet.create({
      container: {
        flexDirection: 'column',
      },
      bookContainer: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 0,
        paddingTop: 0,
      },
      image: {
        marginTop: 8,
        borderRadius: CardRadius,
        alignSelf: 'center',
        resizeMode: 'cover',
      },
    }),
    407: StyleSheet.create({
      container: {
        flex: 1,
        marginHorizontal: 12,
        marginVertical: 12,
        height: 36,
        borderRadius: 4,
        backgroundColors: ['#FFF3E1', '#2B3035'],
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      tagTitle: {
        fontSize: 14,
        fontWeight: '700',
        colors: ['#FF8132', '#686D74'],
        alignSelf: 'center',
        paddingVertical: 10,
      },
      iconView: {
        width: 12,
        height: 12,
        alignSelf: 'center',
      },
    }),
    408: StyleSheet.create({
      container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        // height: 39.5,
        borderWidth: 0,
      },
      tagContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 36,
        marginTop: 3.5,
        // marginLeft: 12,
        // marginRight: 12,
        overflow: 'hidden',
        // borderRadius: 5,
        // backgroundColors: ['blue'],
      },
      backgroundImg: {
        flex: 1,
        position: 'absolute',
      },
      cardImage: {
        position: 'absolute',
        width: 56,
        height: 39.5,
        top: 0,
        left: 24,
      },
      tagText: {
        maxWidth: 300,
        height: 36,
        fontSize: 12,
        borderRadius: 5,
        colors: ['#DF8A00', '#977e52'],
        lineHeight: 36,
        marginLeft: 83,
        // backgroundColors: ['red']
      },
      tagArrow: {
        width: 4.5,
        height: 10,
        marginLeft: 2,
      },
      redDot: {
        width: 5,
        height: 5,
        marginLeft: 2,
        marginRight: 2,
        borderRadius: 10,
        backgroundColors: ['#FF682D'],
      },
    }),
    413: StyleSheet.create({
      wrapper: {
        backgroundColors: ['#FFFAEC', '#202327'],
        borderWidth: 0,
        borderRadius: 6,
        overflow: 'hidden',
        marginLeft: 12,
        marginRight: 12,
      },
      topWrapper: {
        padding: 12,
        marginTop: 24,
        marginBottom: 8,
      },
      txt: {
        fontSize: 16,
        colors: ['#242424', '#686d74'],
        lineHeight: 26,
        textAlign: 'justify',
      },
      flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      botWrapper: {
        padding: 12,
      },
      bottomTxt: {
        fontSize: 12,
        colors: ['#242424', '#686d74'],
        fontWeight: 'bold',
        lineHeight: 18,
      },
      icon: {
        width: 4.5,
        height: 8,
        marginLeft: 2,
      },
      readButton: {
        borderRadius: 12,
        backgroundColors: ['#FF8132', '#7C470C'],
      },
      readButtonText: {
        fontSize: 11,
        lineHeight: 18,
        colors: ['white', '#7f8386'],
        paddingHorizontal: 6,
        paddingVertical: 2,
      },
    }),
    418: StyleSheet.create({
      bg: {
        position: 'absolute',
        top: 0,
        left: 0,
      },
      title: {
        width: 180,
        height: 20,
        marginBottom: 8,
      },
      button: {
        borderColor: '#4C9AFA',
        borderWidth: 0.5,
        borderRadius: 3,
        color: '#4C9AFA',
        fontSize: 17,
        width: 140,
        height: 38,
        lineHeight: 38,
        textAlign: 'center',
      },
      dots: {
        height: 2,
        width: 12,
        marginLeft: 5,
        marginRight: 5,
      },
      close: {
        width: 30,
        height: 17,
        position: 'absolute',
        top: 17,
        right: 17,
      },
      center: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      rowCenter: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 5,
      },
      pageWrapper: {
        width: 750,
      },
      tips: {
        fontSize: 15,
        color: '#AAAAAA',
        lineHeight: 18,
        height: 18,
        textAlign: 'center',
        marginBottom: 5,
      },
      cards: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 10,
        paddingRight: 10,
        justifyContent: 'center',
      },
      picContainer: {
        marginTop: 8,
        marginLeft: 5,
        marginRight: 5,
        position: 'relative',
      },
      titleContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
  },
};

export const TABLIST_CONFIG = {
  tabParam: {
    // tab 列表相关参数，剥离出公共属性，方便各个地方style属性一致，也方便各种曝光及位置计算
    height: 40,
    width2: 35, // 2个字的 tab 宽度
    width3: 49, // 3个字的 tab 宽度
    width4: 67, // 4个字的 tab 宽度
    focusWidth2: 44, // 2个字的 tab 选中态宽度
    focusWidth3: 65, // 3个字的 tab 选中态宽度
    focusWidth4: 86, // 4个字的 tab 选中态宽度
    leftPadding: 12, // 第一个 tab 左边距
    rightPadding: 13, // 最后一个 tab 右边距
    paddingLeft: 7.5, // 普通 tab 左padding
    paddingRight: 7.5, // 普通 tab 右padding
  },
  tabInfo: {
    useCustomTabWidth: true,
    tapScrollCenterEnable: true,
    tabSwitchAnimationEnabled: true, // 点击tab时是否显示切换动画
    tanViewBackgroundColors: ['transparent'], // tab列表背景颜色
    tabScrollBarStretch: true, // tab的焦点条是否显示拉伸的动画
    tabScrollBarMaxStretchWidth: 100, // tab的焦点条是否显示拉伸的动画
    tabScrollBarEnable: true, // 是否显示焦点条
    tabScrollBarWidth: 42, // 焦点条宽度
    tabScrollBarColors: ['#1776F1', '#395c86', '#1776F1', '#1776F1'], // 焦点条背景颜色
    textSelectBold: true, // 选中的tab文字是否加粗
    tabScrollBarHeight: 0, // 焦点条高度
    tabScrollBarSecondColors: ['#00DD6E', '#05B551', '#00DD6E', '#00DD6E'], // NEW_B3,
    tabScrollBarBottomMargin: 0, // 焦点条距离底部间距
    tabScrollBarCornerRadius: 2, // 焦点条圆角大小
  },
  adrTabInfo: {
    textColors: ['#242424', '#686d74', '#242424', 'white'], // A1
    textSelectColors: ['#242424', '#686d74', '#242424', 'white'], // A1
  },
};

export const EXT_TABBAR_CONFIG = {
  redRightPos: -5, // 普通tab红点right值
  rightTabRedPos: 1, // 最右一个tab红点right值

  // 0: 未知类型; 1:纯双汉字; 2: 纯三汉字 3: 纯四汉字 4：双汉字图片 5: 三汉字图片 6: 四汉字图片
  tabIconType: [48, 34, 48, 64, 53, 69, 85],
  tabIconFocusType: [63, 42, 63, 81, 70, 91, 109],

  rightShadowPos: 34,
  littleRedRightPos: 2, // 普通tab小红点right值
  littleRightTabRedPos: 8, // 最右一个tab小红点right值
  redDotWidth1: 15, // 一位数宽度
  redDotWidth2: 20, // 另外数宽度
};
