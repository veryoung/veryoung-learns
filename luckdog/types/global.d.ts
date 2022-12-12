interface HippyGlobal {
  Hippy: any;
}

declare namespace global {
  export declare const global: HippyGlobal;
}

declare namespace NodeJS {
  export interface Global {
    enterTime: any;
    shouldTabRefreshDirect: any;
    timerOfDoBeaconByEnterOver3s: any;
  }
}
