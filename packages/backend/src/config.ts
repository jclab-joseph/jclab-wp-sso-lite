import util from 'util';
import fs from 'fs';
import WaitSignal from 'wait-signal';
import {ConfigLoader} from './config_loaders/loader';
import {AWSSecretsManagerConfigLoader} from './config_loaders/aws_sm';

export class ConfigManager {
  private _loading: boolean = false;
  private _loadSignal: WaitSignal<boolean> = new WaitSignal();
  private _loaders: ConfigLoader[] = [];
  private _envs: Record<string, string> = {};

  constructor() {
    this._loaders.push(new AWSSecretsManagerConfigLoader());
  }

  public load(): Promise<boolean> {
    if (this._loading) {
      return this._loadSignal.wait();
    }
    this._loading = true;
    return this._loaders.reduce(
      (prev, cur) => prev.then((loaded) => {
        if (loaded) return loaded;
        return cur.probe()
          .then((available) => {
            if (available) {
              return cur.read()
                .then((envs) => {
                  Object.assign(this._envs, envs);
                  return true;
                });
            }
            return false;
          });
      }), Promise.resolve(false)
    )
      .then((r) => {
        this._loadSignal.signal(r);
        return r;
      });
  }

  public get(key: string): string | undefined {
    return this._envs[key] || process.env[key];
  }

  public get PRIVATE_KEY_FILE(): string {
    return this.get('PRIVATE_KEY_FILE') || '/secret-keys/private.key.json';
  }
  public get PRIVATE_KEY_DATA(): string {
    return this.get('PRIVATE_KEY_DATA');
  }
  public get PUBLIC_KEYS_FILE(): string {
    return this.get('PUBLIC_KEYS_FILE') || '/secret-keys/public.keys.json';
  }
  public get PUBLIC_KEYS_DATA(): string {
    return this.get('PUBLIC_KEYS_DATA');
  }
  public get ENCRYPTION_KEY_FILE(): string {
    return this.get('ENCRYPTION_KEY_FILE') || '/secret-keys/enc.key.json';
  }
  public get ENCRYPTION_KEY_DATA(): string {
    return this.get('ENCRYPTION_KEY_DATA');
  }
  public get HTTP_PORT(): number {
    return parseInt(this.get('HTTP_PORT') || '0');
  }
  public get DB_HOST(): string {
    return this.get('DB_HOST');
  }
  public get DB_PORT(): number {
    return parseInt(this.get('DB_PORT') || '3306');
  }
  public get DB_USERNAME(): string {
    return this.get('DB_USERNAME');
  }
  public get DB_PASSWORD(): string {
    return this.get('DB_PASSWORD');
  }
  public get DB_NAME(): string {
    return this.get('DB_NAME');
  }
  public get FRONT_PROXY_URL(): string {
    return this.get('FRONT_PROXY_URL');
  }

  public getPrivateKey(): Promise<string> {
    if (this.PRIVATE_KEY_DATA) {
      return Promise.resolve(this.PRIVATE_KEY_DATA);
    }
    return util.promisify(fs.readFile)(this.PRIVATE_KEY_FILE, { encoding: 'utf-8' });
  }

  public getPublicKeys(): Promise<string> {
    if (this.PUBLIC_KEYS_DATA) {
      return Promise.resolve(this.PUBLIC_KEYS_DATA);
    }
    return util.promisify(fs.readFile)(this.PUBLIC_KEYS_FILE, { encoding: 'utf-8' });
  }

  public getEncryptionKey(): Promise<any> {
    return (this.ENCRYPTION_KEY_DATA ? Promise.resolve(this.ENCRYPTION_KEY_DATA) : util.promisify(fs.readFile)(this.ENCRYPTION_KEY_FILE, { encoding: 'utf-8' }))
      .then(data => JSON.parse(data));
  }
}

const instance = new ConfigManager();
export default instance;
