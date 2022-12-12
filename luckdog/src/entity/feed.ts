import { ActiveTab, DynamicTabItem } from '@tencent/luckbox-readdata-feedsentity';

/** 本地缓存动态tab相关数据 */
export interface LocalDynamicTabs {
  dynamicTabs: DynamicTabItem[];
  activeTab: ActiveTab;
}

export * from '@tencent/luckbox-readdata-feedsentity';
