declare module "meerkat" {
  interface BugoutOptions {
    seed?: string;
    announce?: string[];
  }

  interface Bugout {
    seed: string;
    address(): string;
    on(event: string, callback: (...args: any[]) => void): void;
    register(
      method: string,
      handler: (address: string, args: any, callback: Function) => void
    ): void;
    rpc(
      address: string,
      method: string,
      args: any,
      callback: (result: any) => void
    ): void;
  }

  export default class Bugout {
    constructor(options?: BugoutOptions);
    seed: string;
    address(): string;
    on(event: string, callback: (...args: any[]) => void): void;
    register(
      method: string,
      handler: (address: string, args: any, callback: Function) => void
    ): void;
    rpc(
      address: string,
      method: string,
      args: any,
      callback: (result: any) => void
    ): void;
  }
}
