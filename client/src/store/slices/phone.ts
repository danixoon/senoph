import axios from "axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type PhoneState = {
  filter: WithFilter<
    PartialNullable<
      WithoutId<
        Omit<
          ApiResponse.Phone,
          "accountingDate" | "assemblyDate" | "commissioningDate"
        >
      > & {
        search: string;
      }
    >
  >;
} & WithItems<Database.Phone>;

const initialState: PhoneState = {
  items: [],
  filter: {
    search: null,
    factoryKey: null,
    holderId: null,
    inventoryKey: null,
    modelId: null,
    typeId: null,
    offset: 0,
    amount: 100,
  },
};

// Преобразует объект фильтра в пригодный для запроса объект,
// пропуская пустые (null и []) значения, делает объект одноуровневым
const prepareFilter = (filter: PhoneState["filter"]) => {
  const parsedFilter: Partial<typeof filter> = {};
  // OMEGALUL typing kostil' for object properties filtering
  for (const k in filter)
    (parsedFilter[k as any] as any) =
      (filter[k as any] as any) ?? undefined;

  return parsedFilter;
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const fetchPhones = createAsyncThunk(
  "phone/fetchPhones",
  async (_, thunk) => {
    const { phone } = thunk.getState() as { phone: PhoneState };
    const response = await axios.get("/phone", {
      params: prepareFilter(phone.filter),
    });

    console.log(response);

    return response.data as number[];
  }
);

export const createPhone = createAsyncThunk(
  "phone/createPhone",
  async (_, thunk) => {
    const { filter } = (thunk.getState() as any).phone;
    const response = await axios.post("/phone");

    thunk.dispatch(fetchPhones());

    return response.data;
  }
);

export const phoneSlice = createSlice({
  name: "phone",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(fetchPhones.fulfilled, (state, action) => {
      action;
    }),
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
