/** 福利卡片奖品类型 */
export enum AwardType {
  /** 红包 */
  RED_PACK = 'RED_PACK',
  /** 快乐金币 */
  COIN = 'COIN',
  /** 腾讯视频会员 */
  VIDEO_VIP = 'VIDEO_VIP',
  /** 王者礼包 */
  LOTTERY_PACKAGE = 'LOTTERY_PACKAGE',
}

/** 福利卡片奖品 */
export class Award {
  /** 奖品图片 */
  public imageUrl = '';
  /** 奖品名称 */
  public name = '';
  /** 奖品类型 */
  public type: AwardType = AwardType.COIN;
}
