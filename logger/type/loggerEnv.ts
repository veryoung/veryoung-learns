import { LoggerEnvInfo, LoggerOS, LogScene, LogType } from './type';

export class LoggerEnvInfoClazz implements LoggerEnvInfo {
  public logtype = LogType.loginfo;

  public logscene = LogScene.default;

  public channel = '';

  public enter_channel = '';

  public url = '';

  public uuid = '';

  public version = 0;

  public sdk_version = '';

  public endpoint = '';

  public os = LoggerOS.desektop;
}
