export interface DatabaseSeed {
  run(): Promise<void>;
}
