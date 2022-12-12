import { isTopTab } from '@/luckbox';
import { colorParse } from '@tencent/hippy-react-qb';
import FeedsAbilities from '../framework/FeedsAbilities';
import FeedsTheme from '../framework/FeedsTheme';
import { DynamicTabItem, SkinModelType, TabBackground } from '../entity';

type ColorStyle = {
  colors: string[];
};

type BgColorStyle = {
  backgroundColors: string[];
};

/** 系统顶部状态栏类型 */
export type StatusBarType = Required<TabBackground>['statusBarType'] | 'defaultStyle';

/** 是否需要适配背景色 */
export const useCustomColor = (): boolean => FeedsTheme.returnSkinId() === SkinModelType.NORMAL;

/** TabPageBackgroundManager实例化选项 */
export interface TabpageBgManangerOptions {
  /** 终端提供的设置背景色（图）api */
  nativeAdapter: NativeAdapter;
  /** 是否使用自定义颜色 */
  useCustomColor: () => boolean;
  /** 是否顶部频道 */
  isTopTab: () => boolean;
  /** tab文字颜色配置 */
  tabTextColorsMap: Record<StatusBarType, string[]>;
  /** tab页面背景色配置 */
  customTabBackgroundColorsMap: Record<'defaultStyle' | 'custom', string[]>;
}

/** 终端提供的设置背景api */
export interface NativeAdapter {
  /** 预加载背景图片 */
  presetTabPageImages: (images: string[]) => Promise<any>;
  /** 设置背景色（图） */
  setTabPageBgImage: (tabBackground: TabBackground) => Promise<any>;
  /** 清除背景色（图） */
  clearTabPageBgImage: () => Promise<any>;
}

/** tab页面背景管理器 */
export class TabpageBackgroundManager {
  /** 终端提供的背景设置相关的 api */
  private nativeAdapter: NativeAdapter;
  /** 选项 */
  private options: TabpageBgManangerOptions;
  /** tab 文字颜色 */
  private currentTabTextColors: ColorStyle;
  /** tab 页面背景色 */
  private currentTabPageBackgroundColors: BgColorStyle;

  public constructor(options: TabpageBgManangerOptions) {
    this.nativeAdapter = options.nativeAdapter;
    this.options = options;
    this.currentTabPageBackgroundColors = {
      backgroundColors: options.customTabBackgroundColorsMap.defaultStyle,
    };
    this.currentTabTextColors = {
      colors: options.tabTextColorsMap.defaultStyle,
    };
  }

  /** 预加载头部背景图 */
  public prefetchTabBgImage = (tabList): void => {
    if (!tabList?.length) return;

    const images = tabList.map(({ tabBackground }) => tabBackground?.image).filter(image => !!image);
    this.nativeAdapter.presetTabPageImages(images);
  };

  /** 设置tab头部背景、页面背景 */
  public setTabPageBgImage = (tabInfo?: DynamicTabItem): Promise<any> | void => {
    if (this.options.isTopTab() || !this.options.useCustomColor()) {
      this.setTabTextColors('defaultStyle');
      this.setTabPageBackgroundColors(false);
      return this.nativeAdapter.clearTabPageBgImage();
    }

    const { tabBackground } = tabInfo || {};

    // 设置tab文字颜色
    this.setTabTextColors(tabBackground?.statusBarType);

    // 设置tab页面背景色
    this.setTabPageBackgroundColors(!!tabBackground?.type);

    switch (tabBackground?.type) {
      // 设置背景色
      case 'COLOR':
        return this.nativeAdapter.setTabPageBgImage({
          ...tabBackground,

          // 色值转换
          color: colorParse(tabBackground.color),
        });

      // 设置背景图
      case 'IMG':
        return this.nativeAdapter.setTabPageBgImage(tabBackground);

      // 清除背景
      default:
        return this.nativeAdapter.clearTabPageBgImage();
    }
  };

  /** 获取tab文字颜色 */
  public getTabTextColors = (): ColorStyle => this.currentTabTextColors;

  /** 获取tab页面背景颜色 */
  public getTabPageBackgroundColors = (): BgColorStyle => this.currentTabPageBackgroundColors;

  /** 设置tab页面背景色 */
  private setTabPageBackgroundColors = (needCustom: boolean): void => {
    const { defaultStyle, custom } = this.options.customTabBackgroundColorsMap;

    this.currentTabPageBackgroundColors = {
      backgroundColors: needCustom ? custom : defaultStyle,
    };
  };

  /** 设置tab文字颜色 */
  private setTabTextColors = (statusBarType: StatusBarType = 'defaultStyle'): void => {
    this.currentTabTextColors = {
      colors: this.options.tabTextColorsMap[statusBarType],
    };
  };
}

let managerInstance: TabpageBackgroundManager;

export const getTabpageBackgroundManager = (): TabpageBackgroundManager => {
  if (!managerInstance) {
    managerInstance = new TabpageBackgroundManager({
      useCustomColor,
      isTopTab,
      nativeAdapter: FeedsAbilities,
      tabTextColorsMap: {
        dark: ['#242424'],
        light: ['white'],
        defaultStyle: ['#242424', '#686d74', '#242424', 'white'],
      },
      customTabBackgroundColorsMap: {
        defaultStyle: FeedsTheme.SkinColor.N9,
        custom: ['transparent'],
      },
    });
  }
  return managerInstance;
};
