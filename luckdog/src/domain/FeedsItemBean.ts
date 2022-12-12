export default class FeedsItemBean {
  public already_read: any;
  public business: any;
  public click_report: any;
  public exposure_report: any;
  public ext_info: any;
  public feedback: any;
  public grayInfo: any;
  public item_id: any;
  public local_info: any;
  public local_type: any;
  public need_distort: any;
  public report_info: any;
  public style_data: any;
  public tab_id: any;
  public title: any;
  public ui_style: any;
  public update_time: any;
  public url: any;

  public constructor() {
    this.item_id = ''; //
    this.tab_id = ''; //
    /**
     * 业务类型 //businessID 0:feeds(reserved),1:资讯业务,2:小说业务,3:视频业务,4:生活业务,
     * 5:游戏业务,6:广告,7:话题圈,8:整合人工运营平台,9:软件应用,10:市场部,11:大数据业务 12:商业换量 13 直播
     */
    this.business = 0;
    this.title = ''; // 通用标题
    this.url = ''; // 通用跳转
    this.ui_style = 0; // UI类型
    this.style_data = null; // 样式数据Buf
    this.ext_info = '';
    this.update_time = 0; // 更新时间
    this.local_type = 0;
    this.local_info = 0;
    this.already_read = false; // 已读状态
    this.need_distort = false; // 跳转
    this.feedback = null; // 负反馈
    this.report_info = null; // 大数据上报透传
    this.exposure_report = null; // 广告曝光
    this.click_report = null; // 广告点击,
    this.grayInfo = null; // UI灰度策略
  }
}
