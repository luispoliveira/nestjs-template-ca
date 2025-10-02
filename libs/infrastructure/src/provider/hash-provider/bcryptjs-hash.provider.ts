/* eslint-disable @typescript-eslint/no-unsafe-return */
import { HashProvider } from '@lib/shared';
import { compare, hash } from 'bcryptjs';

export class BcryptjsHashProvider implements HashProvider {
  async generate(payload: string): Promise<string> {
    return await hash(payload, 10);
  }
  async compare(payload: string, hashed: string): Promise<boolean> {
    return await compare(payload, hashed);
  }
}
