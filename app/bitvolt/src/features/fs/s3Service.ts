import { list, ListAllWithPathOutput } from 'aws-amplify/storage';

import { FSRecord, ListOutputItemWithPath } from './types';

export const isFolder = (fs: FSRecord) => !fs.data?.size;

const addItem = (
  source: string,
  target: FSRecord,
  item: ListOutputItemWithPath,
  parentMap: Record<string, FSRecord>
) => {
  const elements = source.split('/');
  const element = elements.shift();

  if (!element) {
    target.data = { ...item, lastModified: item.lastModified?.toISOString() };
    return;
  }

  let child = target.children.find(item => item.name === element);
  if (!child) {
    const path =
      elements.length || !item.size ? `${target.path}${element}/` : `${target.path}${element}`;

    child = { name: element, children: [], path };
    parentMap[path] = target;
    target.children.push(child);
  }

  addItem(elements.join('/'), child, item, parentMap);
};

const processStorageList = (response: ListAllWithPathOutput) => {
  const { items } = response;
  const root: FSRecord = { name: '', path: '', children: [] };
  const parentMap: Record<string, FSRecord> = {};

  items.forEach(item => {
    const path = item.path.split('/').slice(2).join('/');
    addItem(path, root, item, parentMap);
  });

  return { root, parentMap };
};

export const fetchS3Files = async () => {
  return await list({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    path: ({ identityId }) => `private/${identityId!}/`,
    options: { listAll: true },
  }).then(processStorageList);
};
