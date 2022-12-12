/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import {
  Image,
  Text,
  View,
  Platform,
} from '@tencent/hippy-react-qb';
import FeedsTheme from '../FeedsTheme';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsIcon from '../FeedsIcon';
import FeedsUtils from '../FeedsUtils';
import { DEFAULT_FEEDS_STYLE, EXT_TABBAR_CONFIG, TABLIST_CONFIG } from '../FeedsDefaultStyle';
import { dtConst } from '../FeedsConst';
import { CommonProps, DynamicTabItem, SkinModelType, TabIconItem, TabIconType, TabId } from '../../entity';
import { getTabpageBackgroundManager } from '@/presenters';
import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { getDeviceVisitor, throttle } from '@/luckbox';

const TAG = 'FeedsTabBar';
/** 预加载节流频控 */
const PREFETCH_STEP = 3000;

const iconPrefetchedTabs: TabId[] = [];

interface Props extends CommonProps {
  tabInfo: DynamicTabItem;
  curTabId: TabId;
  tabsCount: number;
  left?: boolean;
  right?: boolean;
  redDotNum?: number;
}

type State = {
  /** 是否渲染图片 */
  useImage: boolean;
};

const getItemWidth = (
  tabTitle: string,
  tabParam: Record<string, any>,
  isSelected: boolean,
  tabIcons: TabIconItem[],
) => {
  let itemWidth;
  if (tabTitle.length <= 2) {
    // NBA三个字用两个汉字的宽度
    if (isSelected) {
      itemWidth = tabParam.focusWidth2;
    } else {
      itemWidth = tabParam.width2;
    }
  } else if (tabTitle.length === 3) {
    if (isSelected) {
      itemWidth = tabParam.focusWidth3;
    } else {
      itemWidth = tabParam.width3;
    }
  } else if (isSelected) {
    // 4个字及以上
    itemWidth = tabParam.focusWidth4;
  } else {
    itemWidth = tabParam.width4;
  }

  if (!tabIcons?.length) return itemWidth;

  const [tabIcon] = tabIcons;
  const { normalIconUrl, selectedIconUrl } = tabIcon;
  const iconType = tabIcon.iconType || TabIconType.UNKNOWN;
  const tabIconTypeWidth = EXT_TABBAR_CONFIG.tabIconType[iconType];
  const tabIconFocusTypeWidth = EXT_TABBAR_CONFIG.tabIconFocusType[iconType];
  if (normalIconUrl && !isSelected && tabIconTypeWidth) {
    itemWidth = tabIconTypeWidth;
  } else if (selectedIconUrl && isSelected && tabIconFocusTypeWidth) {
    itemWidth = tabIconFocusTypeWidth;
  }

  return itemWidth;
};

@FeedsProtect.protect
export default class NavItem extends Component<Props, State> {
  public state = {
    useImage: getDeviceVisitor().isAdr() ? this.props.tabInfo?.tabIcons?.length > 0 : false,
  };
  private prefetchSuccess = false;
  private prefetchTimer: NodeJS.Timeout | null = null;
  private prefetchTabIcon = throttle(async (tabInfo: DynamicTabItem): Promise<void> => {
    const { tabIcons, tabId } = tabInfo || {};
    if (!tabIcons?.length) return;

    // 安卓机在即便有图片缓存的情况下，预加载图片依然有一定耗时
    // 此时做一个 300ms 的定时器，如果 300ms 还未加载完成，就先切换到打底文字 tab
    const isAndroid = getDeviceVisitor().isAdr();
    if (isAndroid) {
      if (this.prefetchTimer) clearTimeout(this.prefetchTimer);
      this.prefetchTimer = setTimeout(() => {
        // 如果预加载已经提前完成，则不需要再切换到打底文字 tab 了
        if (this.prefetchSuccess) return;

        this.setState({
          useImage: false,
        });
      }, 300);
    }

    const start = Date.now();

    // 提取 icon url 进行预加载
    const images = tabIcons.reduce((acc: string[], { scene, normalIconUrl, selectedIconUrl }) => {
      // 非当前皮肤模式下的图片不做预加载
      if (scene as unknown as SkinModelType !== FeedsTheme.skinMode) return acc;
      return [...acc, normalIconUrl, selectedIconUrl];
    }, []).filter(url => !!url);

    addKeylink(`${tabId}-tabicon-prefetch`, KeylinkCmd.PR_INFO_SUM);

    // 不用加 try catch
    const prefetchStatus = await this.prefetchImages(images);

    // 针对安卓机做一个预加载图片平均耗时特性上报
    if (isAndroid) {
      addKeylink(`${tabId}-tabicon-prefetchtime=${Date.now() - start}`, KeylinkCmd.PR_AVG);
    }

    // 所有 icon 都加载成功才算成功
    const isAllSuccess = prefetchStatus.every(status => !!status);
    if (!isAllSuccess) return;

    this.onPrefetchSuccess(tabId);
  }, PREFETCH_STEP);

  public constructor(props) {
    super(props);
    const { tabInfo } = this.props;
    this.prefetchTabIcon(tabInfo);
  }

  public UNSAFE_componentWillReceiveProps(nextProps) {
    const tabID = nextProps.tabInfo.tabId || 0;
    if (!iconPrefetchedTabs.includes(tabID)) {
      this.prefetchTabIcon(nextProps.tabInfo);
    }
  }

  public render() {
    const { curTabId, left, right, tabInfo } = this.props;
    const styles = DEFAULT_FEEDS_STYLE.data.tabList;
    const extStyles = DEFAULT_FEEDS_STYLE.data.extTabList;
    const { tabParam: { leftPadding, paddingLeft, rightPadding, paddingRight } } = TABLIST_CONFIG;

    const itemWidth = getItemWidth(
      tabInfo.tabTitle,
      TABLIST_CONFIG.tabParam,
      tabInfo.tabId === curTabId,
      tabInfo.tabIcons,
    );

    const styleObj: Record<string, any> = {
      paddingLeft: left ? leftPadding : paddingLeft,
      paddingRight: right ? rightPadding : paddingRight,
    };

    // ADR text paddingBottom 有bug，设了paddingBottom反而往下跑了
    const focusView = tabInfo.tabId === curTabId ? styles.focusView : null;

    // 有异形图的情况，遵守短图（1~2字）与长图（3~4)字的两种宽度
    return (
      <View
        style={[styles.navItem, styleObj, focusView]}
        dt_pgid={dtConst.dt_pgid}
        dt_pg_params={FeedsUtils.getDtParams({
          rnVersion: getDeviceVisitor().getJsVersion(),
        })}
      >
        {this.state.useImage ? this.renderImageTab(itemWidth) : this.renderTextTab(itemWidth)}
        {this.renderRedDot(extStyles)}
      </View>
    );
  }

  public renderImageTab = (itemWidth: number): JSX.Element | null => {
    const extStyles = DEFAULT_FEEDS_STYLE.data.extTabList;
    const { tabInfo, curTabId } = this.props;

    if (!tabInfo?.tabIcons?.length) return null;

    const url = this.getTabImageUrl(tabInfo.tabIcons, tabInfo.tabId === curTabId);

    // 没有 url 则直接回退到文字
    if (!url) return this.renderTextTab(itemWidth);

    // android做异形非选中态marginTop微调
    if (getDeviceVisitor().isAdr()) {
      (extStyles.specialImage as any).marginTop = 1;
    }

    const imgStyle = tabInfo.tabId === curTabId ? extStyles.specialFocusImage : extStyles.specialImage;

    return (
      <Image
        source={{ uri: url }}
        style={[imgStyle, { width: itemWidth }]}
        noPicMode={{ enable: false }}
        nightMode={{ enable: false }}
        onError={this.onError}
        accessibilityLabel={tabInfo.tabTitle || '标签'}
        accessible
        reportData={{ sourceFrom: 'tabImage' }}
      />
    );
  };

  public renderTextTab = (itemWidth: number): JSX.Element => {
    const styles = DEFAULT_FEEDS_STYLE.data.tabList;
    const { tabInfo, curTabId } = this.props;

    const focusText = tabInfo.tabId === curTabId ? styles.focusText : null;

    return (
      <Text
        style={[
          styles.itemText,
          focusText,
          {
            width: itemWidth,
          },
          getTabpageBackgroundManager().getTabTextColors(),
        ]}
        numberOfLines={1}
      >
        {tabInfo.tabTitle || tabInfo.specialTitle }
      </Text>
    );
  };

  public renderRedDot = (extStyles: Record<string, any>): JSX.Element | null => {
    const { redDotNum } = this.props;

    if (!redDotNum) return null;

    let redDotWidth = extStyles.redDotWidth1;
    let rightPos = extStyles.redRightPos;
    if (redDotNum >= 10) {
      redDotWidth = extStyles.redDotWidth2;
      rightPos -= 1;
    }

    return (
      <View
        style={[
          extStyles.redDot,
          {
            right: rightPos,
            width: redDotWidth,
          },
        ]}
      >
        {redDotNum > 99 ? (
          <Image
            style={extStyles.redEllipsis}
            source={{ uri: FeedsIcon.ellipsis }}
            noPicMode={{ enable: false }}
          />
        ) : (
          <Text
            style={[
              extStyles.redDotNum,
              {
                marginTop: Platform.OS === 'android' ? -1 : 0,
              },
            ]}
            numberOfLines={1}
          >
            {redDotNum}
          </Text>
        )}
      </View>
    );
  };

  public getTabImageUrl = (tabIcons: TabIconItem[], selected: boolean): string => {
    const icon = tabIcons.find((icon) => {
      const scene = icon.scene as unknown as SkinModelType;
      return scene === FeedsTheme.skinMode;
    });

    if (!icon) return '';

    return selected ? icon?.selectedIconUrl : icon?.normalIconUrl;
  };

  private onPrefetchSuccess = (tabId: TabId): void => {
    this.prefetchSuccess = true;

    this.setState({
      useImage: true,
    });

    if (!iconPrefetchedTabs.includes(tabId)) {
      iconPrefetchedTabs.push(tabId);
    }
  };

  private prefetchImages = async (images: string[]): Promise<boolean[]> => {
    try {
      const result = await Promise.all(images.map(imageUrl => Image.getSize(imageUrl)));
      return result.map(size => !!size?.width);
    } catch (err) {
      addKeylink(`${this.props.tabInfo.tabId}-tabicon-prefetcherror`, KeylinkCmd.PR_ERROR_SUM);
      logError(JSON.stringify({ err, images }), `${TAG}.prefetchImages`);
      return [false];
    }
  };

  private onError = (err: any): void => {
    this.setState({
      useImage: false,
    });

    addKeylink(`${this.props.tabInfo.tabId}-tabicon-loaderror`, KeylinkCmd.PR_ERROR_SUM);
    logError(err, `${TAG}.onError`);
  };
}
