import React from 'react';

import {
  StyleSheet,
  View,
  Platform,
  QBVideoView,
  Image,
  ImageLoaderModule,
  QBDeviceModule,
} from '@tencent/hippy-react-qb';
import { logError } from '@/luckdog';

import FeedsPlayIconView from './FeedsPlayIconView';
import FeedsUtils from '../../../framework/FeedsUtils';
import FeedsTheme from '../../../framework/FeedsTheme';
import { FeedsIcon } from './utils';
import NetworkState from '../../../framework/NetworkState';
import FeedsEventEmitter from '../../../framework/FeedsEventEmitter';
import FeedsConst from '../../../framework/FeedsConst';
import { CommonProps, ItemBean } from '../../../entity';

let IMAGE_WIDTH = FeedsUtils.getScreenWidth() + 2;
let IMAGE_HEIGHT = Math.floor((IMAGE_WIDTH * 9) / 16);

const styles = StyleSheet.create({
  cover: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  coverBlur: {},
  videoViewContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  voiceIcon: {
    backgroundColors: ['#00000000'],
    bottom: 3,
    height: 24,
    left: 3,
    position: 'absolute',
    tintColors: FeedsTheme.LiteColor.A5,
    width: 24,
  },
  videoClickView: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColors: ['transparent'],
  },
  voiceView: {
    bottom: 3,
    height: 30,
    right: 3,
    position: 'absolute',
    width: 30,
  },
  pauseView: {
    bottom: 3,
    height: 30,
    left: 3,
    position: 'absolute',
    width: 30,
  },
});

interface Props extends CommonProps {
  itemBean: ItemBean;
  sPicUrl: string;
  sPlayUrl: string;
  width: number;
  height: number;
  style?: Record<string, any>;
  sIconImg: string;
  showTag?: boolean;
  autoPlay?: boolean;
  isMuted?: boolean;
  controls?: boolean;
  title?: string;
  /** 视频浮层是否可以点击 */
  videoCanClick?: boolean;
  /** 是否支持循环播放 */
  loop?: boolean;
  /** 流量下是否可以播放 */
  noWifiCanPlay?: boolean;
  /** 静音事件点击 */
  muteClick?: () => void;

  doBeaconByPlay?: () => void;
  doBeaconByPause?: () => void;
  doBeaconByMute?: () => void;
  click?: () => void;
  setliveRoomState?: (...args) => void;
}

export default class FeedsVideoPlayView extends React.Component<Props> {
  public state = {
    muted: this.props.isMuted, // 当前是否静音状态
    startPlay: false, // 当前是否正在播放状态
    isLoading: false, // 当前是否正在loading状态
    duration: '', // 视频总时长
    timeElapsed: 0, // 视频剩余时长
    isPlayed: false, // 视频是否处于可播放状态（触发过播放的视频isPlayed为true)
    playPercentage: 0, // 当前播放进度
    followButtonFlag: false, // 是否显示关注按钮
    showVideoCover: true, // 是否显示视频poster
    videoShowed: false, // 播放器的首帧是否显示
    reuseInVideoFloat: false, // 播放器复用到视频浮层,
    fullScreenFlag: false, // 是否在全屏播放
    assignedPlayUrl: '', // 指定播放资源地址
    currentTime: 0,
    play: false,
    customControls: true, // 显示自定义的控制栏（暂停、静音）
  };
  public didmountPlayerTimer;
  public tabId = this.props.itemBean?.tab_id?.toString();
  public listener = FeedsEventEmitter.emit(this.onEventToItem.bind(this));
  public refs!: {
    [string: string]: any;
    videoView: any;
  };

  public resetState() {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.setState({
      play: false,
      muted: this.props.isMuted,
      startPlay: false,
      isLoading: false,
      duration: 0, // 视频总时长,单位ms
      currentTime: 0, // 当前播放时间,单位ms
      isPlayed: false,
      customControls: true,
    });
  }

  public getVideoPlayingTime() {
    return this.state.currentTime / 1000;
  }

  public async componentDidMount() {
    try {
      const { sPicUrl, autoPlay = true } = this.props;
      if (sPicUrl) {
        ImageLoaderModule.prefetch(sPicUrl);
      }

      const deviceInfo = FeedsConst.getGlobalConfKV('deviceInfo') || (await QBDeviceModule.getDeviceInfo());
      if (((deviceInfo.networkType === 'wifi' || deviceInfo.isKingCardUser) && autoPlay) || this.props.noWifiCanPlay) {
        this.didmountPlayerTimer = setTimeout(() => {
          this.play();
        }, 500);
      }
    } catch (error) {
      logError(error, 'ItemVideo.componentDidMount');
    }
  }

  // eslint-disable-next-line camelcase
  public UNSAFE_componentWillReceiveProps(nextProps) {
    // 置换时需要重置状态
    if (this.props.itemBean?.item_id !== nextProps.itemBean.item_id) {
      this.resetState();
    }
  }

  public componentWillUnmount() {
    if (this.didmountPlayerTimer) {
      clearTimeout(this.didmountPlayerTimer);
    }
    this.listener.remove();
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  public onEventToItem(_symbolKey, event, obj) {
    const globalConf = this.props.globalConf || {};
    if (event === 32 && (NetworkState.currentNetType === 'WIFI' || this.props.noWifiCanPlay) && globalConf.pageActive) {
      this.play();
      return;
    }
    if (event === FeedsEventEmitter.event.lifecycle) {
      if (obj.lifecycleType === 'deactive') {
        // 移除掉
        if (this.refs.videoView && this.state.play) {
          this.cancelPlay();
        }
      } else if (obj.lifecycleType === 'active' && this.state.isPlayed === true) {
        if (this.refs.videoView) {
          // 重新激活
          this.setState({ isPlayed: false });
          this.play();
        } else if (this.refs.videoView) {
          this.cancelPlay();
        }
      }
    } else if (event === FeedsEventEmitter.event.toPage) {
      if (this.refs.videoView && this.state.play) {
        this.cancelPlay(true);
      }
    }
  }

  public startPlay() {
    if (this.props.click && this.state.play) {
      this.props.click();
    } else {
      this.play();
    }
  }

  public play() {
    if (this.refs.videoView) {
      this.refs.videoView.play();
      this.props.itemBean.reportState = false;
      if (!this.state.isPlayed || !this.state.play) {
        this.setState({ play: true, isLoading: true, isPlayed: true });
      }
    }
  }

  public pause() {
    if (this.refs.videoView) {
      this.refs.videoView.pause();
      this.setState({ play: false, isLoading: false });
    }
  }

  public cancelPlay(deActiveFlag = false) {
    if (this.refs.videoView) {
      if (Platform.OS === 'ios') {
        this.refs.videoView.pause();
      } else {
        this.refs.videoView.reset();
      }
    }
    const { isPlayed } = this.state;
    this.setState({
      play: false,
      isLoading: false,
      startPlay: false,
      isPlayed: deActiveFlag ? isPlayed : false,
    });
  }

  public onPlay = () => {
    const { itemBean } = this.props;
    itemBean?.reportState && (itemBean.reportState = false);
    const { doBeaconByPlay } = this.props;
    this.setState({ play: true, isLoading: false, startPlay: true });
    doBeaconByPlay?.();
  };

  public onPause = () => {
    const { doBeaconByPause } = this.props;
    this.setState({ play: false, startPlay: false, isLoading: false });
    doBeaconByPause?.();
  };

  public onReset = () => {
    const { doBeaconByPlay } = this.props;

    this.setState({ play: false, startPlay: false, isLoading: false });
    doBeaconByPlay?.();
  };

  // 时长变化的时候，把进度回滚到0  at 18/09/11
  public onDurationChange(timeObj) {
    const { duration } = timeObj;
    this.setState({
      duration,
      currentTime: 0,
    });
  }

  public onEnd() {
    this.pause();
  }

  public muteChange = () => {
    const mute = this.state.muted;
    const { doBeaconByMute, muteClick } = this.props;

    this.setState({
      muted: !mute,
    });
    muteClick?.();
    doBeaconByMute?.();
  };

  public onTimeUpdate(timeObj) {
    const { duration } = this.state;
    const { currentTime, playableTime } = timeObj;
    this.setState({
      currentTime,
      duration: duration || playableTime,
    });
  }

  public onVideoExtraEvent(param) {
    if (param?.eventName) {
      const { eventName } = param;
      if (eventName === 'mobileNetCancelPlay' || eventName === 'onPlayStartPending') {
        // 移动网络取消播放或弹出弹框
        this.setState({
          startPlay: false,
          isLoading: false,
        });
      } else if (eventName === 'onPlayStarting') {
        // empty
      } else if (eventName === 'onVideoShowing') {
        this.setState({ isLoading: false, startPlay: true });
      } else if (eventName === 'onPanelShow') {
        this.setState({ customControls: false });
      } else if (eventName === 'onPanelHide') {
        this.setState({ customControls: true });
      }
    }
  }
  public goPause = () => {
    if (!this.state.play) {
      this.play();
    } else {
      this.pause();
    }
  };

  public onExitFullScreen = () => {
    if (!this.state.play) {
      this.play();
    }
  };

  public render() {
    IMAGE_WIDTH = FeedsUtils.getScreenWidth() + 2;
    IMAGE_HEIGHT = Math.floor((IMAGE_WIDTH * 9) / 16);

    const { customControls, muted } = this.state;
    const { globalConf, itemBean, sPlayUrl, sPicUrl, width, height, controls = false, title = '', loop = false, videoCanClick = false } = this.props;

    let poster: any = null;
    let playIconBlock: any = null;
    let pauseView: any = null;
    let iconView: any = null;
    let clickView: any = null;
    const videoStyle = { width: width ? width : IMAGE_WIDTH, height: height ? height : IMAGE_HEIGHT };
    if (!this.state.play) {
      poster = (
        <Image
          style={this.props.showTag ? styles.coverBlur : styles.cover}
          source={{ uri: sPicUrl }}
          reportData={{ sourceFrom: itemBean.item_id }}
        />
      );
      playIconBlock = <FeedsPlayIconView globalConf={globalConf} iconClick={this.goPause} />;
    } else {
      pauseView = <View style={styles.pauseView} onClick={this.goPause}>
        <Image
          style={styles.voiceIcon}
          reportData={{ sourceFrom: itemBean.item_id }}
          source={{ uri: FeedsIcon.pauseIcon }}
          noPicMode={{ enable: false }}
        />
      </View>;
      iconView = (
        <View style={styles.voiceView} onClick={this.muteChange}>
          <Image
            style={styles.voiceIcon}
            reportData={{ sourceFrom: itemBean.item_id }}
            source={{ uri: muted ? FeedsIcon.feeds_mute_new : FeedsIcon.feeds_unmute_new }}
            noPicMode={{ enable: false }}
          />
        </View>
      );
      if (videoCanClick) {
        clickView = <View style={[styles.videoClickView, videoStyle]} onClick={() => this.props?.click?.()} />;
      }
    }
    return (
      <View style={styles.videoViewContainer}>
        <QBVideoView
          src={{ uri: sPlayUrl }}
          style={videoStyle}
          ref="videoView"
          poster={sPicUrl}
          onPause={this.onPause}
          onReset={this.onReset}
          onPlay={this.onPlay}
          onDurationChange={this.onDurationChange.bind(this)}
          onEnd={this.onEnd.bind(this)}
          onTimeUpdate={this.onTimeUpdate.bind(this)}
          onExitFullScreen={this.onExitFullScreen.bind(this)}
          loop={loop}
          muted={muted}
          controls={controls}
          extraParams={{
            videoTitle: title,
            reusePlayer: 'true',
            disableMobileToast: globalConf.isKingCardUser ? 'true' : 'false',
          }}
          onVideoExtraEvent={e => this.onVideoExtraEvent(e)}
        />
        {clickView}
        {poster}
        {playIconBlock}
        {customControls ? iconView : null}
        {customControls ? pauseView : null}
      </View>
    );
  }
}
