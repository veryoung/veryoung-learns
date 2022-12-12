import { reportUDS, BusiKey } from '@/luckdog';
import { TreasureStatus } from './constant';

enum ReportStatusType {
  ENABLED = 1, // 可以开启福袋
  COOLING = 2, // 冷却时间内，暂不能开启福袋
  DISABLED = 3, // 今日次数耗尽，今日内不能开启福袋
  NOLOGIN = 4, // 未登录
  UNKNOWN = 5, // 未知情况，兜底用
}

// 福袋 status 映射到上报 status
const statusMap = {
  [TreasureStatus.ENABLED]: ReportStatusType.ENABLED,
  [TreasureStatus.COOLING]: ReportStatusType.COOLING,
  [TreasureStatus.DISABLED]: ReportStatusType.DISABLED,
};

class Reporter {
  /**
   * 获取状态类型值
   */
  public getStatusType = (status: TreasureStatus, isLogin?: boolean) => {
    if (!isLogin) return ReportStatusType.NOLOGIN;

    const { ENABLED, COOLING, DISABLED } = TreasureStatus;
    if ([ENABLED, COOLING, DISABLED].includes(status)) {
      return statusMap[status];
    }

    return ReportStatusType.UNKNOWN;
  };

  /**
   * floating 曝光
   */
  public reportFloatingExposure = ({ statusType }: { statusType: ReportStatusType }) => {
    reportUDS(BusiKey.EXPOSE__TREASURE_FLOATING, {}, {
      ext_data1: statusType,
    });
  };

  /**
   * floating 点击
   */
  public reportFloatingClick = ({ statusType }: { statusType: ReportStatusType }) => {
    reportUDS(BusiKey.CLICK__TREASURE_FLOATING, {}, {
      ext_data1: statusType,
    });
  };

  /**
   * toast 曝光
   */
  public reportToastExposure = () => {
    reportUDS(BusiKey.EXPOSE__TREASURE_TOAST);
  };

  /**
   * 开福袋弹窗曝光
   */
  public reportWeakModalExposure = () => {
    reportUDS(BusiKey.EXPOSE__TREASURE_WEAK_MODAL);
  };

  /**
   * 开福袋弹窗点击
   */
  public reportWeakModalClick = ({ elementName }: {
    elementName: 'watch_vedio_for_money' | 'continue' | 'close';
  }) => {
    reportUDS(BusiKey.CLICK__TREASURE_WEAK_MODAL, {}, {
      ext_data1: elementName,
    });
  };

  /**
   * 激励视频弹窗曝光
   */
  public reportPowerModalExposure = () => {
    reportUDS(BusiKey.EXPOSE__TREASURE_POWER_MODAL);
  };

  /**
   * 激励视频弹窗点击
   */
  public reportPowerModalClick = ({ elementName }: {
    elementName: 'continue' | 'close';
  }) => {
    reportUDS(BusiKey.CLICK__TREASURE_POWER_MODAL, {}, {
      ext_data1: elementName,
    });
  };
}

export default new Reporter();
