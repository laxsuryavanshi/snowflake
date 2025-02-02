import { ListAllWithPathOutput } from 'aws-amplify/storage';

export type ListOutputItemWithPath = ListAllWithPathOutput['items'][number];

export interface FSRecord {
  /** Unique name within a directory */
  name: string;

  children: FSRecord[];

  /** Unique name across all files starting from root */
  path: string;

  /** The original record received from S3 API */
  data?: Omit<ListOutputItemWithPath, 'lastModified'> & { lastModified: string | undefined };
}

export interface FSState {
  /** The root of the file system */
  fs: FSRecord | null;

  status: 'idle' | 'loading' | 'success' | 'fail';

  error: string | null;

  /** The current directory being viewed */
  currentFS: FSRecord | null;

  /** A map of child to parent directory */
  parentMap: Record<string, FSRecord>;

  upload?: {
    status: 'idle' | 'loading' | 'success' | 'fail';

    error?: string;
  };
}
