import { BaseBook } from './books';
import { Tag } from './tag';

/** 通过书关联视频卡片 */
export class VideoBook extends BaseBook {
  /** 视频资源名字 */
  public videoName = '';
  /** 视频资源url */
  public videoUrl = '';
  /** 视频落地页 */
  public videoJumpUrl = '';
  /** 视频封面地址 */
  public videoPicUrl? = '';
  /** 视频标签 */
  public videoTag?: Tag[];
  /** 视频描述 */
  public videoTips?: string;
}

