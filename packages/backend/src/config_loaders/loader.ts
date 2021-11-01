export interface ConfigLoader {
  probe(): Promise<boolean>;
  read(): Promise<Record<string, string>>;
}
