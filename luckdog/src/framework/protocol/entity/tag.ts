/** tag实体 */
export class Tag {
  /** Icon尺寸对应前端的尺寸 对应前端配置 */
  public size = 0;
  /** 标签名 */
  public tagName = '';
  /** 标签样式 */
  public tagStyle: TagStyle  = TagStyle.NORMAL;
  /** IconUrl */
  public iconUrl?: string;
  /** 对应前端展示颜色 按照前端字典给颜色 */
  public tagColors?: TagColors = TagColors.BLUE;
}

export enum TagColors {
  /** 灰色 */
  GRAY = 0,
  /** 蓝色 */
  BLUE = 2,
  /** 红色 */
  RED = 4,
  /** 深蓝色 */
  DARK_BLUE = 5
}

export enum TagStyle {
  /** 普通展示（根据颜色渲染角标背景）*/
  NORMAL = 0,
  /** 图片展示（根据下发的iconUrl展示角标） */
  PIC = 1,
}
