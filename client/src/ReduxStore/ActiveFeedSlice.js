import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  ActiveFeed: "Home",
  user: null,
  // PreviousComp:['Home'],
  muted: true,
};

// console.log(initialState.PreviousComp)

const ActiveFeedSlice = createSlice({
  name: "ActiveFeed",
  initialState,
  reducers: {
    ChangeActiveFeed: (state, action) => {
      const changeactivefeed = action.payload;
      state.ActiveFeed = changeactivefeed;
    },
    UpdateUser: (state, action) => {
      const user = action.payload;
      state.user = user;
    },
    // updatePreviousComp:(state,action) =>{
    //   // console.log(action.payload)
    //   const prevComp = action.payload;
    //   state.PreviousComp.push(prevComp)
    //   if(state.PreviousComp.length > 2){
    //     state.PreviousComp.shift()
    //   }
    // },
    setPreviewmuted: (state, action) => {
      const ismuted = action.payload;
      state.muted = ismuted;
    },
  },
});

export const {
  ChangeActiveFeed,
  UpdateUser,
  // updatePreviousComp,
  setPreviewmuted,
} = ActiveFeedSlice.actions;
export default ActiveFeedSlice.reducer;
