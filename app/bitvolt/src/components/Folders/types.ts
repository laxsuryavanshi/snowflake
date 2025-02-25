import { ListAllWithPathOutput } from 'aws-amplify/storage';

export type ListOutputItemWithPath = ListAllWithPathOutput['items'][number];

export interface FileSystemEntity {
  /** Unique name within a directory */
  name: string;

  children: FileSystemEntity[];

  /** Unique name across all files starting from root */
  path: string;

  /** The original record received from S3 API */
  data?: ListOutputItemWithPath;

  parent?: FileSystemEntity | null;
}

export interface InjectedFileSystem {
  fileSystem: FileSystemEntity | null;

  setFileSystem: (f: FileSystemEntity | null) => void;
}
