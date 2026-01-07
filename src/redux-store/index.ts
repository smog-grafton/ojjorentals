// Third-party Imports
import { configureStore, createSlice } from '@reduxjs/toolkit'

// Slice Imports
// Demo Redux slices removed - not used by rentals system
// Adding minimal dummy reducer to satisfy Redux requirements

const dummySlice = createSlice({
  name: 'dummy',
  initialState: {},
  reducers: {}
})

export const store = configureStore({
  reducer: {
    dummy: dummySlice.reducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
