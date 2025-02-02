import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { addItem, createS3Folder, fetchS3Files, isFolder } from './s3Service';
import { FSRecord, FSState } from './types';

export const fetchFiles = createAsyncThunk('fs/fetchFiles', fetchS3Files);

export const createFolder = createAsyncThunk('fs/createFolder', createS3Folder);

const initialState: FSState = {
  fs: null,
  status: 'idle',
  error: null,
  currentFS: null,
  parentMap: {},
};

const fsSlice = createSlice({
  name: 'fs',
  initialState,
  reducers: {
    setCurrentFS: (state, action: PayloadAction<FSRecord>) => {
      if (!isFolder(action.payload)) {
        return;
      }
      state.currentFS = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchFiles.pending, state => {
      state.status = 'loading';
    });

    builder.addCase(fetchFiles.fulfilled, (state, action) => {
      state.status = 'success';
      state.fs = action.payload.root;
      state.currentFS = action.payload.root;
      state.parentMap = action.payload.parentMap;
    });

    builder.addCase(fetchFiles.rejected, (state, action) => {
      state.status = 'fail';
      state.error = action.error.message ?? null;
    });

    builder.addCase(createFolder.pending, state => {
      state.upload = { status: 'loading' };
    });

    builder.addCase(createFolder.fulfilled, (state, action) => {
      state.upload = { status: 'success' };
      if (action.payload && state.fs) {
        const path = action.payload.path.split('/').slice(2).join('/');
        addItem(path, state.fs, action.payload, state.parentMap);
      }
    });

    builder.addCase(createFolder.rejected, (state, action) => {
      state.upload = { status: 'fail', error: action.error.message };
    });
  },
});

export const { setCurrentFS } = fsSlice.actions;
export default fsSlice.reducer;
