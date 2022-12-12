import { Link } from '../card';
import { BaseBook } from './books';

/** 排行榜卡片 */
export class RankItem {
  /** 榜单id */
  public groupId = '';
  /** 排行榜名，单榜单后台传空字符串 */
  public groupName = '';
  /** 是否横向排列 */
  public isRow = false;
  /** 排行榜行数（不传前端默认值为4，根据总条数除以行数得到列数，除不尽则丢弃） */
  public rowNum = 0;
  /** 书籍内容 */
  public bookList: BaseBook[] = [];
  /** 右上角点击落地页 */
  public jumpLink: Link = new Link();
  /** 榜单对应的traceid */
  public traceid = '';
}
