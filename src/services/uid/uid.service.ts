import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class UidService {
  generate(length: number = 21) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }
}
