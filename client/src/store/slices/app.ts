import axios from "axios";
import api from "../../api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AppState = {
  token: string | null;
  user: Api.Models.User;
} & WithStatus;

const initialState: AppState = {
  token: null,
  user: { id: -1, username: "...", role: "unknown", name: "..." },
  status: "idle",
};

// export const fetchAccount = createAsyncThunk(
//   "app/fetchAccount",
//   async (params: Api.GetQuery<"get", "/account">, thunk) => {
//     const { app } = thunk.getState() as StoreType;
//     const response = await axios.get("/api/account", {
//       headers: { Authorization: app.token },
//     });

//     const data = response.data as Api.GetResponse<"get", "/account">;

//     thunk.dispatch(appSlice.actions.setAccount(data));

//     return data;
//   }
// );

// export const fetchAccount = createAsyncThunk(
//   "app/fetchAccount",
//   async (params: Api.GetQuery<"get", "/account">, thunk) => {
//     const { app } = thunk.getState() as StoreType;
//     const response = await axios.get("/api/account", {
//       headers: { Authorization: app.token },
//     });

//     const data = response.data as Api.GetResponse<"get", "/account">;

//     return data;
//   }
// );

export const login = createAsyncThunk(
  "app/login",
  async (params: string | Api.GetQuery<"get", "/account/login">, thunk) => {
    try {
      let token = params as string;
      if (typeof params !== "string") {
        const response = await api.request("get", "/account/login", {
          params,
          body: {},
        });
        token = response.token;
      }

      const account = await api.request("get", "/account", {
        params: {},
        body: {},
        token,
      });

      // thunk.dispatch(appSlice.actions.setAccount(account));

      return { token, account };
    } catch (err) {
      throw thunk.rejectWithValue(err.error);
    }
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState: {
    ...initialState,
    token: localStorage.getItem("token") ?? null,
  },
  reducers: {
    logout: (state, { payload }: PayloadAction) => {
      window.localStorage.removeItem("token");

      return initialState;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(login.pending, (state, { payload }) => {
        state.status = "loading";
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.status = payload as Api.Error;

        window.localStorage.removeItem("token");
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        const { token, account } = payload;

        state.user = { ...initialState.user, ...account };
        state.token = token;
        state.status = "success";

        window.localStorage.setItem("token", token);
      }),
  // .addCase(fetchAccount.pending, (state, { payload }) => {
  //   state.user.status = "loading";
  // })
  // // .addCase(fetchAccount.rejected, (state, { payload }) => {
  // //   state.user.status = (payload as Api.WithError).error;
  // // })
  // .addCase(fetchAccount.fulfilled, (state, { payload }) => {
  //   state.user.status = "success";
  // }),
});

export const { logout } = appSlice.actions;
export default appSlice.reducer;

// export const createPhone = createAsyncThunk(
//   "phone/createPhone",
//   async (_, thunk) => {
//     const { filter } = (thunk.getState() as any).phone;
//     const response = await axios.post("/phone");

//     thunk.dispatch(fetchPhones());

//     return response.data;
//   }
// );

// export const phoneSlice = createSlice({
//   name: "phone",
//   initialState,
//   // The `reducers` field lets us define reducers and generate associated actions
//   reducers: {},
//   // The `extraReducers` field lets the slice handle actions defined elsewhere,
//   // including actions generated by createAsyncThunk or in other slices.
//   extraReducers: {
//     [fetchPhones.fulfilled.toString()]: (state, action) => {
//       state.list = action.payload;
//     },
//   },
// });

// // The function below is called a selector and allows us to select a value from
// // the state. Selectors can also be defined inline where they're used instead of
// // in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// // export const selectCount = (state) => state.counter.value;

// // We can also write thunks by hand, which may contain both sync and async logic.
// // Here's an example of conditionally dispatching actions based on current state.
// // export const incrementIfOdd = (amount) => (dispatch, getState) => {
// //   const currentValue = selectCount(getState());
// //   if (currentValue % 2 === 1) {
// //     dispatch(incrementByAmount(amount));
// //   }
// // };
