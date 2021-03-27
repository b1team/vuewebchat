import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		user: {},
		token: localStorage.getItem('token') || null,
		isLogin: false,
	},
	getters: {
		user: (state) => {
			return state.user;
		},
		token: (state) => {
			return state.token;
		},
		isLogin: (state) => {
			return state.isLogin;
		}
	},
	mutations: {
		user(state, user) {
			state.user = user;
		},
		token(state, token) {
			state.token = token;
		},
		isLogin(state, isLogin) {
			state.isLogin = isLogin;
		}
	},
	actions: {
		user(context, user) {
			context.commit("user", user);
		},
		token(context, token) {
			context.commit("token", token);
		},
		isLogin(context, isLogin){
			context.commit("isLogin", isLogin);
		}
	},
	modules: {},
});
