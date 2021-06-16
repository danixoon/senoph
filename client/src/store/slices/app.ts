import axios from "axios";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  status: "idle",
  filter: {
    model: null,
    modelIds: [],
    date: {
      from: null,
      to: null
    },
    offset: 0,
    amount: 100
  }
};


// Преобразует объект фильтра в пригодный для запроса объект,
// пропуская пустые (null и []) значения, делает объект одноуровневым
const prepareFilter = (filter: any) => {
  const result = {
    model: filter.model ?? undefined,
    modelIds: filter.modelIds.length > 0 ? filter.modelIds : undefined,
    dateFrom: filter.date.from ?? undefined,
    dateTo: filter.date.to ?? undefined,
    offset: filter.offset ?? undefined,
    amount: filter.amount ?? undefined
  };

  return result;
}


// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const fetchPhones = createAsyncThunk(
  'phone/fetchPhones',
  async (_, thunk) => {
    const { filter } = (thunk.getState() as any).phone;
    const response = await axios.get("/phone", { params: prepareFilter(filter) });

    console.log(response);

    return response.data;
  }
);

export const createPhone = createAsyncThunk(
  'phone/createPhone',
  async (_, thunk) => {
    const { filter } = (thunk.getState() as any).phone;
    const response = await axios.post("/phone");

    thunk.dispatch(fetchPhones());

    return response.data;
  }
);

export const phoneSlice = createSlice({
  name: 'phone',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    [fetchPhones.fulfilled.toString()]: (state, action) => {
      state.list = action.payload
    }
  }
});

// export const { increment, decrement, incrementByAmount } = phoneSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// export const selectCount = (state) => state.counter.value;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd = (amount) => (dispatch, getState) => {
//   const currentValue = selectCount(getState());
//   if (currentValue % 2 === 1) {
//     dispatch(incrementByAmount(amount));
//   }
// };

export default phoneSlice.reducer;
