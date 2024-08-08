import { configureStore } from "@reduxjs/toolkit";
import ActiveFeedReducer from '../ReduxStore/ActiveFeedSlice.js'

const store = configureStore({
    reducer:ActiveFeedReducer
})

export default store;