export interface ICache {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any, option?: any) => Promise<any>;
  reset: (key: string) => Promise<any>;
  del: (key: string) => Promise<any>;
}
