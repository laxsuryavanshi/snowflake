import { list, ListAllWithPathOutput, uploadData } from 'aws-amplify/storage';

import { FileSystemEntity, ListOutputItemWithPath } from './types';

export const isFolder = (fs: FileSystemEntity) => !fs.data?.size;

export const addItem = (source: string, target: FileSystemEntity, item: ListOutputItemWithPath) => {
  const elements = source.split('/');
  const element = elements.shift();

  if (!element) {
    target.data = item;
    return;
  }

  let child = target.children.find(item => item.name === element);
  if (!child) {
    const path =
      elements.length || !item.size ? `${target.path}${element}/` : `${target.path}${element}`;

    child = { name: element, children: [], path, parent: target };
    target.children.push(child);
  }

  addItem(elements.join('/'), child, item);
};

const processStorageList = (response: ListAllWithPathOutput) => {
  const { items } = response;
  const root: FileSystemEntity = { name: '', path: '', children: [] };

  items.forEach(item => {
    const path = item.path.split('/').slice(2).join('/');
    addItem(path, root, item);
  });

  return root;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const getPrefix = (identityId: string | undefined): string => `private/${identityId!}/`;

export const fetchS3Files = async () => {
  return await list({
    path: ({ identityId }) => getPrefix(identityId),
    options: { listAll: true },
  }).then(processStorageList);
};

export const createS3Folder = async (path: string) => {
  path = path.trim();

  if (!path) {
    return;
  }

  if (!path.endsWith('/')) {
    path += '/';
  }

  const task = uploadData({
    path: ({ identityId }) => `${getPrefix(identityId)}${path}`,
    data: '',
    options: { preventOverwrite: true },
  });

  return await task.result;
};

export const FILESYSTEM_TOKEN = 'FILESYSTEM_TOKEN';
