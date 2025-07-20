/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { transfer } from 'comlink';
import copy from 'copy-to-clipboard';
import { type Algorithm } from 'sha.js';

import { WorkerPool } from './lib';
import WorkerScript from './worker.ts?worker&url';

interface RemoteWorker {
  computeHash(fileData: ArrayBuffer, algorithm: Algorithm): string;
}

// Use WorkerScript directly as the worker constructor
const workerOptions: WorkerOptions = { type: 'module' };
const maxSize = 10;
const workerPool = new WorkerPool<RemoteWorker>(WorkerScript, workerOptions, maxSize);

const algorithms = new Map<string, Algorithm>([
  ['SHA (SHA-0)', 'sha'],
  ['SHA-1', 'sha1'],
  ['SHA-224', 'sha224'],
  ['SHA-256', 'sha256'],
  ['SHA-384', 'sha384'],
  ['SHA-512', 'sha512'],
]);

const hashFunctionSelect = document.getElementById('hashFunction') as HTMLSelectElement;
const options = algorithms.entries().map(([name, value]) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = name;
  return option;
});
hashFunctionSelect.append(...options);

const filesInput = document.getElementById('files') as HTMLInputElement;
filesInput.addEventListener('change', () => {
  updateFileList(filesInput.files);
});

const form = document.querySelector('form')!;
form.addEventListener('reset', () => {
  updateFileList(null);
});
form.addEventListener('submit', event => {
  event.preventDefault();

  const files = filesInput.files;
  const algorithm = hashFunctionSelect.value;
  if (!files || files.length === 0 || !algorithm) {
    return;
  }

  Array.from(files).forEach(file => {
    void file
      .arrayBuffer()
      .then(fileData => {
        return workerPool.execute('computeHash', [
          transfer(fileData, [fileData]),
          algorithm as Algorithm,
        ]);
      })
      .then(hash => {
        // Display the computed hash
        const fileList = document.getElementById('fileList') as HTMLUListElement;
        const listItem = fileList.querySelector(`[data-file-name="${file.name}"]`)!;
        const input = listItem.querySelector('input')!;
        input.value = hash;
        const inputContainer = listItem.querySelector('.list-col-wrap')!;
        inputContainer.classList.remove('hidden');
        const copyButton = inputContainer.querySelector('button')!;
        copyButton.addEventListener('click', () => {
          copy(hash);
          copyButton.textContent = 'Copied!';
          setTimeout(() => {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      });
  });
});

function updateFileList(files: FileList | null): void {
  const fileList = document.getElementById('fileList') as HTMLUListElement;
  fileList.innerHTML = '';

  if (!files || files.length === 0) {
    return;
  }

  fileList.innerHTML = Array.from(files).map(getFileListItem).join('');
}

function getFileListItem(file: File): string {
  return `
<li class="list-row" data-file-name="${file.name}">
  <div></div>
  <div>${file.name}</div>
  <div class="list-col-wrap join hidden">
    <input class="input w-full join-item" type="text" readonly />
    <button class="btn btn-info join-item" type="button">Copy</button>
  </div>
</li>
  `;
}
