/**
 * 收敛全局实验相关配置，对外暴露按实验划分的方法集合，不暴露具体实验变量
 */
import { RainbowExperFlagVal } from '@/luckbox';
import { addKeylink } from '@/luckdog';
import { writeSharedSettings } from '@/utils/shareSettings';
import { STORAGE } from '../constants';

/** 频道实验配置类型 */
export interface ExpertsData {
  /** 福袋退避原则 */
  welfarePendantRule: RainbowExperFlagVal,
}

const expertsData: ExpertsData = {
  welfarePendantRule: RainbowExperFlagVal.DEFAULT,
};

export const getExpertData = (): ExpertsData => expertsData;

/**
 * 更新实验数据
 */
export const updateExpertsData = (data: ExpertsData): void => {
  Object.keys(data).forEach((item): void => {
    if (data[item] !== undefined) {
      expertsData[item] = data[item];
    }
  });
  addKeylink(`更新实验信息为:${JSON.stringify(expertsData)}`);
  writeSharedSettings(STORAGE.EXPERTSDATA, expertsData);
};

/** 悬浮福袋退避原则 */
export const welfarePendantRule = {
  /** 命中 */
  isHit: (): boolean => [RainbowExperFlagVal.HIT1, RainbowExperFlagVal.HIT2].includes(expertsData.welfarePendantRule),

  /** 强退避 */
  strong: (): boolean => expertsData.welfarePendantRule === RainbowExperFlagVal.HIT1,

  /** 弱退避 */
  weak: (): boolean => expertsData.welfarePendantRule === RainbowExperFlagVal.HIT2,
};

