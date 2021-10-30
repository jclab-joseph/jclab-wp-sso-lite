import fs from 'fs';
import util from 'util';

const PRIVATE_KEY_FILE = process.env.PRIVATE_KEY_FILE || '/secret-keys/private.key.json';
const PRIVATE_KEY_DATA = process.env.PRIVATE_KEY_DATA;
const PUBLIC_KEYS_FILE = process.env.PUBLIC_KEYS_FILE || '/secret-keys/public.keys.json';
const PUBLIC_KEYS_DATA = process.env.PUBLIC_KEYS_DATA;
const ENCRYPTION_KEY_FILE = process.env.ENCRYPTION_KEY_FILE || '/secret-keys/enc.key.json';
const ENCRYPTION_KEY_DATA = process.env.ENCRYPTION_KEY_DATA;

export const HTTP_PORT = parseInt(process.env.HTTP_PORT || '0');
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = parseInt(process.env.DB_PORT || '3306');
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;

export const FRONT_PROXY_URL = process.env.FRONT_PROXY_URL;

export function getPrivateKey(): Promise<string> {
  if (PRIVATE_KEY_DATA) {
    return Promise.resolve(PRIVATE_KEY_DATA);
  }
  return util.promisify(fs.readFile)(PRIVATE_KEY_FILE, { encoding: 'utf-8' });
}

export function getPublicKeys(): Promise<string> {
  if (PUBLIC_KEYS_DATA) {
    return Promise.resolve(PUBLIC_KEYS_DATA);
  }
  return util.promisify(fs.readFile)(PUBLIC_KEYS_FILE, { encoding: 'utf-8' });
}

export function getEncryptionKey(): Promise<any> {
  return (ENCRYPTION_KEY_DATA ? Promise.resolve(ENCRYPTION_KEY_DATA) : util.promisify(fs.readFile)(ENCRYPTION_KEY_FILE, { encoding: 'utf-8' }))
    .then(data => JSON.parse(data));
}
