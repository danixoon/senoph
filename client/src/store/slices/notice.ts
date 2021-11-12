import axios from "axios";
import api from "../../api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";


export type Notice = {
  id: any;
  message: string;
  createTime: number;
  lifeTime: number;
  type: "danger" | "info";
};

export type NoticeState = {
  notices: Notice[];
};

const initialState: NoticeState = {
  notices: [],
};

export const noticeSlice = createSlice({
  name: "notice",
  initialState: {
    ...initialState,
  },
  reducers: {
    createNotice: (
      state,
      { payload }: PayloadAction<Omit<Notice, "createTime">>
    ) => {
      state.notices.push({
        ...payload,
        createTime: Date.now(),
      });
    },
    removeNotice: (state, { payload }: PayloadAction<{ id: any }>) => {
      state.notices = state.notices.filter(
        (notice) => notice.id !== payload.id
      );
    },
  },
});

export const { createNotice, removeNotice } = noticeSlice.actions;
export default noticeSlice.reducer;
