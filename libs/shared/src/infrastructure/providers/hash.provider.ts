export interface HashProvider {
  generate(payload: string): Promise<string>;
  compare(payload: string, hashed: string): Promise<boolean>;
}
