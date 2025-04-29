import { createStore } from 'vuex';
import axios from 'axios';

export default createStore({
  state: {
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = true;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  actions: {
    async setUser({ commit }) {
      try {
        const response = await axios.get('/auth/me');
        commit('setUser', response.data);
      } catch (error) {
        commit('clearUser');
      }
    },
    logout({ commit }) {
      localStorage.removeItem('token');
      commit('clearUser');
    },
  },
});