import { Tag } from './tag';

/** 书籍实体的基类 */
export class BaseBook {
  /** 资源id */
  public resourceId = '';
  /** 资源名称 */
  public resourceName = '';
  /** 简介 */
  public brief?: string;
  /** 作者 */
  public author?: string;
  /** 图片地址 */
  public picUrl?: string;
  /** 跳转地址 */
  public jumpUrl?: string;
  /** 推荐理由 */
  public reason?: string[];
  /** 分数 */
  public score?: string;
  /** 人气 (这里是处理好之后的值,携带对应数值单位)*/
  public hot?: string;
  /** 分类 (xx,yy,zz) */
  public category?: string;
  /** 书籍状态 */
  public status?: string;
  /** 书籍属性标签(独家 原创标签)*/
  public tag?: Tag;
  /** 书籍状态标签(完本 更新 连载) */
  public statusTag?: Tag;
  /** 运营语 */
  public description?: string;
}

