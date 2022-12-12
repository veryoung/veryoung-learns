/**
 * 推荐 debug info 组件
 */

import React from 'react';
import {
  Text,
} from '@tencent/hippy-react-qb';
import FeedsUtils from '../../../framework/FeedsUtils';
import { WEB_HOST } from '@/framework/FeedsConst';
interface Props {
  info: string;
  style: Record<string, any>;
}

/** 查看 debug info 详情 */
const viewDebugInfo = (info: string): void => {
  const url = `${WEB_HOST}/qbread/api/feeds/debuginfo?q=${encodeURIComponent(info)}`;
  FeedsUtils.doLoadUrl(url);
};

export const DebugInfo = ({ info, style }: Props) => <Text
  style={style}
  numberOfLines={1}
  onClick={() => viewDebugInfo(info)}
>{info}</Text>;
