import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState: { config: ApiResponse.FetchFilterConfig } = {
  config: {
    departments: [],
    models: [],
    types: [],
  },
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  // extraReducers: (builder) =>
  // builder.addCase(fetchPhones.fulfilled, (state, action) => {
  //   action;
  // }),
});

export const createPhone = createAsyncThunk(
  "app/fetchConfig",
  async (_, thunk) => {
    const response = await axios.get("/phone");

    // thunk.dispatch(fetchPhones());

    return response.data;
  }
);

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

// // export const { increment, decrement, incrementByAmount } = phoneSlice.actions;

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
