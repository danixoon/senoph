import axios from "axios";
import {
  createAction,
  createAsyncThunk,
  createReducer,
  createSlice,
  Dispatch,
  PayloadAction,
} from "@reduxjs/toolkit";
import {
  LocationChangeAction,
  LOCATION_CHANGE,
  push,
} from "connected-react-router";
import qs from "query-string";
import { locationQueryReducer, updateQuery } from "../utils";
import { store } from "store";

export type QueryState = PartialNullable<
  Omit<Required<Api.GetQuery<"get", "/phone">>, "offset" | "amount"> & {
    selectedId: any;
    page: number;
  }
> & { offset: number; pageItems: number };

export type PhonePageMode = "edit" | "view";

export type PhoneState = {
  mode: PhonePageMode;
  selectionIds: number[];
  filter: QueryState;
};

const initialState: PhoneState = {
  mode: "view",
  selectionIds: [],
  filter: {
    search: null,
    factoryKey: null,
    inventoryKey: null,
    phoneModelId: null,
    phoneTypeId: null,
    category: null,
    accountingDate: null,
    assemblyDate: null,
    comissioningDate: null,
    departmentId: null,
    holderId: null,
    exceptIds: null,
    authorId: null,
    ids: null,
    sortKey: null,
    sortDir: null,
    page: null,
    selectedId: null,
    offset: 0,
    pageItems: 40,
  },
};

// Преобразует объект фильтра в пригодный для запроса объект,
// пропуская пустые (null и []) значения, делает объект одноуровневым
// const prepareFilter = (filter: PhoneState["filter"]) => {
//   const parsedFilter: Partial<typeof filter> = {};
//   // OMEGALUL typing kostil' for object properties filtering
//   for (const k in filter)
//     (parsedFilter[k as any] as any) =
//       (filter[k as any] as any) ?? undefined;

//   return parsedFilter;
// };

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
// export const fetchPhones = createAsyncThunk(
//   "phone/fetchPhones",
//   async (_, thunk) => {
//     const { phone } = thunk.getState() as { phone: PhoneState };
//     const response = await axios.get("/phone", {
//       params: prepareFilter(phone.filter),
//     });

//     console.log(response);

//     return response.data as number[];
//   }
// );

// export const createPhone = createAsyncThunk(
//   "phone/createPhone",
//   async (_, thunk) => {
//     const { filter } = (thunk.getState() as any).phone;
//     const response = await axios.post("/phone");

//     thunk.dispatch(fetchPhones());

//     return response.data;
//   }
// );

// const filterChange = createAction<QueryState, "filter.change">("filter.change");

export const phoneSlice = createSlice({
  name: "phone",
  initialState,
  reducers: {
    updateSelection: (state, action: PayloadAction<{ ids: number[] }>) => {
      state.selectionIds = action.payload.ids;
    },
    // changeMode: (state, action: PayloadAction<{ mode: PhonePageMode }>) => {
    //   state.mode = action.payload.mode;
    // },
    // updateFilter: (state, action: PayloadAction<Partial<QueryState>>) => {
    //   for (const key in action.payload) {
    //     const k = key as keyof typeof action.payload;
    //     if (action.payload[k] !== undefined)
    //       state.filter[k] = action.payload[k];
    //   }
    // },
  },
  extraReducers: (builder) =>
    locationQueryReducer(
      "/phone",
      builder,
      initialState.filter,
      (state, action) => {
        const mode = action.payload.location.pathname.split(
          "/"
        )[2] as PhonePageMode;
        state.mode = mode;
      }
    ),
});

export const updateFilter = (qs: Partial<QueryState>) => {
  const filter = store.getState().phone.filter;
  return updateQuery({ ...filter, ...qs });
};
export const changeMode = (mode: PhonePageMode) => {
  // const location = store.getState().router.location;
  const filter = store.getState().phone.filter;

  return updateQuery(filter, `/phone/${mode}`);
  // const filter = store.getState().phone.filter;
  // return push({ ...location, pathname: `/phone/${mode}` });
};

export const { updateSelection } = phoneSlice.actions;

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
