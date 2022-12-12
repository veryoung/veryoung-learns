export const globalConf = {
  guid: '15e6a0949380148fcf587cb51d5e88cb',
  qua2:
    'QV=3&PL=ADR&PR=QB&PP=com.tencent.mtt&PPVN=11.3.5.5001&TBSVC=45001&CO=BK&COVC=045530&PB=GE&VE=P&DE=PHONE&CHID=0&LCID=12581&MO= GM1900 &RL=1080*2218&OS=10&API=29&DS=64&RT=32&REF=qb_0&TM=00',
  sdkVersion: '3.8',
  qbid: '125c015807255d18',
  orientation: 2,
  muted: true,
  appId: 138,
  NetInfoReach: 'WIFI',
  isKingCardUser: false,
  style: {
    style: {
      23: {
        container: { flexDirection: 'column' },
        bookContainer: { paddingLeft: 12, paddingRight: 12, paddingBottom: 0, paddingTop: 0 },
        image: { marginTop: 8, borderRadius: 6, alignSelf: 'center', resizeMode: 'cover' },
      },
      407: {
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
        iconView: { width: 12, height: 12, alignSelf: 'center' },
      },
      408: {
        container: { flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', borderWidth: 0 },
        tagContainer: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          height: 36,
          marginTop: 3.5,
          overflow: 'hidden',
        },
        backgroundImg: { flex: 1, position: 'absolute' },
        cardImage: { position: 'absolute', width: 56, height: 39.5, top: 0, left: 24 },
        tagText: {
          maxWidth: 300,
          height: 36,
          fontSize: 12,
          borderRadius: 5,
          colors: ['#DF8A00', '#977e52'],
          lineHeight: 36,
          marginLeft: 83,
        },
        tagArrow: { width: 4.5, height: 10, marginLeft: 2 },
        redDot: { width: 5, height: 5, marginLeft: 2, marginRight: 2, borderRadius: 10, backgroundColors: ['#FF682D'] },
      },
      413: {
        wrapper: {
          backgroundColors: ['#FFFAEC', '#202327'],
          borderWidth: 0,
          borderRadius: 6,
          overflow: 'hidden',
          marginLeft: 12,
          marginRight: 12,
        },
        topWrapper: { padding: 12, marginTop: 24, marginBottom: 8 },
        txt: { fontSize: 16, colors: ['#242424', '#686d74'], lineHeight: 26, textAlign: 'justify' },
        flexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
        botWrapper: { padding: 12 },
        bottomTxt: { fontSize: 12, colors: ['#242424', '#686d74'], fontWeight: 'bold', lineHeight: 18 },
        icon: { width: 4.5, height: 8, marginLeft: 2 },
        readButton: { borderRadius: 12, backgroundColors: ['#FF8132', '#7C470C'] },
        readButtonText: {
          fontSize: 11,
          lineHeight: 18,
          colors: ['white', '#7f8386'],
          paddingHorizontal: 6,
          paddingVertical: 2,
        },
      },
      418: {
        bg: { position: 'absolute', top: 0, left: 0 },
        title: { width: 180, height: 20, marginBottom: 8 },
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
        dots: { height: 2, width: 12, marginLeft: 5, marginRight: 5 },
        close: { width: 30, height: 17, position: 'absolute', top: 17, right: 17 },
        center: { alignItems: 'center', justifyContent: 'center' },
        rowCenter: { justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginTop: 5 },
        pageWrapper: { width: 750 },
        tips: { fontSize: 15, color: '#AAAAAA', lineHeight: 18, height: 18, textAlign: 'center', marginBottom: 5 },
        cards: {
          flexWrap: 'wrap',
          flexDirection: 'row',
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 10,
          paddingRight: 10,
          justifyContent: 'center',
        },
        picContainer: { marginTop: 8, marginLeft: 5, marginRight: 5, position: 'relative' },
        titleContainer: { position: 'absolute', top: 0, left: 0, justifyContent: 'center', alignItems: 'center' },
      },
      '*': {
        container: { paddingLeft: 12, paddingRight: 12, paddingTop: 12, paddingBottom: 12 },
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
        title: { fontWeight: 'normal' },
        titleColors: {
          NORMAL: ['#242424', '#686d74', '#242424', 'white'],
          CLICKED: ['#666666', '#50555c', '#24242480', '#ffffff80'],
          BG_NORMAL: ['#242424', '#686d74', '#242424', '#242424'],
          BG_CLICKED: ['#666666', '#686d74', '#666666', '#666666'],
        },
        bgModeBackgroundColors: ['transparent', '#181b1f', 'transparent', 'transparent'],
        SPLITTER: {
          NONE: { height: 0 },
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
        playIcon: {
          imagePlayContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          },
          icon: { width: 44, height: 44 },
        },
      },
      tabList: {
        tabParam: {
          height: 40,
          width2: 35,
          width3: 49,
          width4: 67,
          focusWidth2: 44,
          focusWidth3: 65,
          focusWidth4: 86,
          leftPadding: 12,
          rightPadding: 13,
          paddingLeft: 7.5,
          paddingRight: 7.5,
        },
        tabInfo: {
          useCustomTabWidth: true,
          tapScrollCenterEnable: true,
          tabSwitchAnimationEnabled: true,
          tabViewBackgroundColors: ['#00000000', '#00000000', '#ffffffbf', '#0000007f'],
          tabScrollBarStretch: true,
          tabScrollBarMaxStretchWidth: 100,
          tabScrollBarEnable: true,
          tabScrollBarWidth: 42,
          tabScrollBarColors: ['#1776F1', '#395c86', '#1776F1', '#1776F1'],
          textSelectBold: true,
          tabScrollBarHeight: 0,
          tabScrollBarSecondColors: ['#00DD6E', '#05B551', '#00DD6E', '#00DD6E'],
          tabScrollBarBottomMargin: 0,
          tabScrollBarCornerRadius: 2,
        },
        adrTabInfo: {
          textColors: ['#242424', '#686d74', '#242424', 'white'],
          textSelectColors: ['#242424', '#686d74', '#242424', 'white'],
        },
        wrap: { flex: 1, flexDirection: 'column' },
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
        navItem: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#00000000', overflow: 'visible' },
        itemText: {
          textAlign: 'center',
          textAlignVertical: 'center',
          colors: ['#242424', '#686d74', '#242424', 'white'],
          fontSize: 16,
          fontWeight: 'normal',
          opacity: 0.8,
        },
        focusView: { paddingBottom: -1 },
        focusText: { marginTop: -2, fontSize: 21, fontWeight: 'bold', opacity: 1 },
      },
      extTabList: {
        redDotBg: {
          position: 'absolute',
          top: 0,
          right: 13,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColors: ['white', '#23282d', '#eeeeee', '#333333'],
        },
        redDotCnt: {
          height: 21,
          borderRadius: 10.5,
          backgroundColors: ['#FA7270', '#764143', '#FA7270', '#FA7270'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColors: ['white', '#7f8386', 'white', 'white'],
        },
        redWidth1: 28,
        redWidth2: 35,
        redWidth3: 34,
        redDotCntContent: { marginLeft: 6 },
        redEllipsis: { width: 8, height: 2 },
        redNum: { fontSize: 13, colors: ['white', '#7f8386', 'white', 'white'], textAlign: 'center' },
        redArrow: { width: 6, height: 10, marginRight: 4 },
        redRightPos: -5,
        rightTabRedPos: 1,
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
          borderColors: ['white', '#7f8386', 'white', 'white'],
        },
        littleRedRightPos: 2,
        littleRightTabRedPos: 8,
        redDotWidth1: 15,
        redDotWidth2: 20,
        redDotNum: { fontSize: 11, colors: ['white', '#7f8386', 'white', 'white'] },
        leftShadow: {
          position: 'absolute',
          left: 0,
          width: 6,
          height: 40,
          tintColors: ['white', '#23282d', '#ffffff20', '#00000010'],
        },
        rightShadow: {
          position: 'absolute',
          width: 12,
          height: 40,
          tintColors: ['white', '#23282d', '#ffffff20', '#00000010'],
        },
        rightShadowPos: 34,
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
          tintColors: ['#666666', '#50555c', '#24242480', '#ffffff80'],
        },
        image: { width: 35, height: 20, resizeMode: 'contain', opacity: 0.8 },
        focusImage: { width: 44, height: 26, marginTop: 6.5, marginBottom: 11.5, resizeMode: 'contain', opacity: 1 },
        specialImage: {
          height: 40,
          resizeMode: 'contain',
          backgroundColors: ['transparent', 'transparent', 'transparent', 'transparent'],
          marginTop: 1,
        },
        specialFocusImage: {
          marginTop: -1,
          height: 40,
          resizeMode: 'contain',
          backgroundColors: ['transparent', 'transparent', 'transparent', 'transparent'],
        },
        tabIconType: [48, 32, 48, 64, 53, 69, 85],
        tabIconFocusType: [63, 42, 63, 81, 70, 91, 109],
        tipsBg: { resizeMode: 'stretch', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
        tipsText: {
          fontSize: 14,
          colors: ['white', '#7f8386', '#ffffff20', 'white'],
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
        newTabTags: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 },
        tabTitle: {
          fontSize: 9,
          textAlignVertical: 'center',
          textAlign: 'center',
          colors: ['white', '#7f8386', '#ffffff20', 'white'],
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
        highlightBubble: { position: 'absolute', left: 10, top: 32, height: 35, justifyContent: 'flex-end' },
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
        refreshTipsEnter: { position: 'absolute', bottom: 0, width: 62, height: 62, zIndex: 9999 },
        leftPosition: { left: 6 },
        rightPosition: { right: 6 },
        lottieBall: { position: 'absolute', bottom: 0, width: 202, height: 64, zIndex: 9999 },
        pageTurningTips: { width: 182, height: 54, position: 'absolute', right: 0, top: 4 },
        refreshTipsBG: { width: 62, height: 62 },
        refreshTipsEnterImg: {
          width: 25,
          height: 25,
          zIndex: 1,
          marginTop: 18.5,
          marginLeft: 18.5,
          position: 'absolute',
        },
        lottieBallData: { width: 165, height: 76, position: 'absolute', bottom: -10, right: -6 },
        refreshTipsEnterImg_arrow_0: { width: 18, height: 9, zIndex: 1, marginTop: 22, marginLeft: 21.5 },
        refreshTipsEnterImg_arrow_1: { width: 18, height: 9, zIndex: 1, marginTop: 0, marginLeft: 21.5 },
        preloadLottie: { position: 'absolute', width: 10, height: 10, bottom: 100, left: 0, opacity: 0 },
        resetAnimation: { transform: [{ rotate: '0deg' }] },
        line: {
          position: 'absolute',
          left: 0,
          top: 44,
          backgroundColors: ['#eeeeee', '#333333', '#eeeeee', '#333333'],
          height: 0,
        },
      },
    },
    version: 1,
    minRNVersion: 8150,
    grayId: 0,
  },
  startUpType: 3,
  qbVersion: 11355001,
  originalQbVersion: '11.3.5.5001',
  primaryKey: '133640320',
  pageUrl: 'qb://tab/feedschannel?component=FeedsNovelPage&module=novelsingletab&title=小说&ch=004760',
  env: 'real',
  refreshType: 1,
  appInstallTime: 1615883379555,
  appUpdateTime: 1615883379555,
  pageActive: true,
  initActive: false,
  toPageModule: 'unknow',
  curTabId: 181,
  refreshStyleVer: 1,
  timeCost: {
    time_1: '2021-03-22 11:21:48.791',
    time_2: '2021-03-22 11:21:48.792',
    doStartRefreshStart: '2021-03-22 11:21:48.966',
    setDeviceIdsStart: '2021-03-22 11:21:48.996',
    loadDataSourceStart: '2021-03-22 11:21:49.6',
    requestItemListStart: '2021-03-22 11:21:49.8',
    tabId: 181,
    inner_requestItemList1: '2021-03-22 11:21:49.9',
    inner_requestItemList2: '2021-03-22 11:21:49.9',
    inner_requestItemList3: '2021-03-22 11:21:49.9',
    inner_requestItemList4: '2021-03-22 11:21:49.9',
    inner_requestItemList5: '2021-03-22 11:21:49.10',
    inner_requestItemList6: '2021-03-22 11:21:49.12',
    getFeedsTabListsStart: '2021-03-22 11:21:49.12',
    getFeedsTabListsCost: 657,
    getFeedsTabListsEnd: '2021-03-22 11:21:49.669',
    requestItemListEnd: '2021-03-22 11:21:49.670',
    freshCnt: -1,
    loadDataSourceEnd: '2021-03-22 11:21:49.688',
  },
  idInfo: {
    qadid: '01FD32ED41724659D0BFDFEA11D875A9',
    taid: '0101869F141B6809A40992ECD03C82AF5B32A9C1378C9A5CC8DBDA0DE7EEEAD83E68203FB87A96BF2C8A4AD9',
    oaid:
      '019AA1027206D51EB7D20440E54B8BE789B525765C6E4AE1C4491DB1F32BD7F83A9AD9FB44784B7CBC1C8EA7A5ABD9EFC1CA24F2F4D8C610296D409C6192CF160B601D4CB006DA4E66',
  },
  isInfoCached: false,
  rnVersion: '8311',
  barRedPointHasClicked: false,
  hasBarRedPointExist: false,
  SELECT_TAB_PAGEID: 181,
  subType: 'tab',
  deviceInfo: {
    qua2:
      'QV=3&PL=ADR&PR=QB&PP=com.tencent.mtt&PPVN=11.3.5.5001&TBSVC=45001&CO=BK&COVC=045530&PB=GE&VE=P&DE=PHONE&CHID=0&LCID=12581&MO= GM1900 &RL=1080*2218&OS=10&API=29&DS=64&RT=32&REF=qb_0&TM=00',
    isNotchDevice: true,
    ua:
      'Mozilla/5.0 (Linux; U; Android 10; zh-cn; GM1900 Build/QKQ1.190716.003) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/11.3 Mobile Safari/537.36',
    perfclass: 2,
    qimei: '2474dc7bfa115498',
    macAddress: '02:00:00:00:00:00',
    guid: '15e6a0949380148fcf587cb51d5e88cb',
    imei: '',
    id: '2474dc7bfa115498',
    qua: 'ADRQBX113_P/1135001&X5MTT_3/051355&ADR&6813914& GM1900 &0&12581&Android10 &V3',
    networkType: 'wifi',
    dpi: '420',
    isKingCardUser: false,
    brand: 'oneplus',
  },
  extInfo: {},
  loadDataType: '1',
  leaveTime: 1616383132538,
  accountInfo: {
    head: 'http://thirdqq.qlogo.cn/g?b=oidb&k=znvKhw0blRia0Taib4DCYFjQ&s=640&t=1556437642',
    A2: '',
    unionid: '',
    appid: '100446242',
    qbid: '125c015807255d18',
    nickname: 'hilon',
    skey: '',
    commonid: 'CID_9529C9A3E72AF96316B4F50CB6288321',
    uin: '896AD7A1ADF145D51CE2CBC82BCD512B',
    type: 4,
    token: '0D010A5063257D4B47FAE15F8A37DC3A',
  },
  connectInfo: { wifi_mac: '70:0f:6a:0f:dc:28', ssid: '"Tencent-WiFi"' },
  PICK_CARD_EXPOSE_TIME_428_KEY: 0,
  transitionAnim: [1, 0, 0, 0],
  lastRefreshTime: 1616383309688,
  welfareTime: { url: 'https://qbact.html5.qq.com/mall?addressbar=hide', time: 0 },
  topAutoHide: 0,
  top_hide_first_refresh: 0,
};

export const commonProps = {
  parent: {},
  globalConf,
};