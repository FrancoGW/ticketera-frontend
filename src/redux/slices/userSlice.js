import { createSlice } from "@reduxjs/toolkit";
import userApi from "../../Api/user"; // Asegúrate de que la ruta sea correcta

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setUserData: (state, action) => {
      state.loading = false;
      state.error = null;
      state.data = action.payload;
    },

    clearUser: () => initialState,
  },
});

export const {
  setLoading,
  setError,
  setUserData,
  clearUser,
} = userSlice.actions;

// Thunks
export const fetchUserProfile = () => async (dispatch) => {
  try {
    dispatch(setLoading());
    const response = await userApi.getProfile();
    dispatch(setUserData(response.data));
  } catch (error) {
    dispatch(setError(error.message));
    console.error("Error fetching user profile:", error);
  }
};



export default userSlice.reducer;
