import { expose } from 'comlink';
import SHA, { type Algorithm } from 'sha.js';

function computeHash(fileData: ArrayBuffer, algorithm: Algorithm): string {
  return SHA(algorithm).update(new Uint8Array(fileData)).digest('hex');
}

expose({ computeHash });
