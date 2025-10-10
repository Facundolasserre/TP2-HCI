import {randomBytes} from 'crypto';

export function generateUserToken() {
  return randomBytes(8).toString('hex');
}