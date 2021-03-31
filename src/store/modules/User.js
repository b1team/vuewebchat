import axios from "axios";

const state = {
	isLogin: false,
	user: {},
	token: localStorage.getItem("token") || "",
	status: "",
	currentUserId: null,
	newProfile: null,
};

const getters = {
	isLogin: (state) => state.isLogin,
	token: (state) => state.token,
	user: (state) => state.user,
	currentUserId: (state) => state.currentUserId,
	status: (state) => state.status,
	newProfile: (state) => state.newProfile,
};

const actions = {
	login({ commit }, user) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "token",
				data: user,
			})
				.then((response) => {
					const token = response.data.access_token;
					localStorage.setItem("token", token);
					localStorage.setItem("isLogin", true);
					commit("auth_success", token);
					resolve(response);
				})
				.catch((error) => {
					localStorage.removeItem("token");
					reject(error);
				});
		});
	},

	register({ commit }, user) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "users",
				data: user,
			})
				.then((response) => {
					console.log(response);
					commit("register_success");
					resolve(response);
				})
				.catch((error) => {
					console.log(error);
					reject(error);
				});
		});
	},

	logout({ commit }) {
		return new Promise((resolve) => {
			commit("logout");
			delete axios.defaults.headers.common["Authorization"];
			resolve();
		});
	},

	getUser({ commit }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "get",
				url: "/users/me",
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("user", response.data);
					resolve(response);
				})
				.catch((error) => {
					console.log(error);
					reject(error);
				});
		});
	},

	changeProfile({ commit }, data) {
		return new Promise((resolve, reject) => {
			axios({
				method: "put",
				url: "users",
				data: data,
				headers: { Authorization:"Bearer " + localStorage.getItem("token") },
			})
				.then((response) => {
					commit("profile", data);
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},
};

const mutations = {
	auth_success(state, token) {
		state.token = token;
		state.isLogin = true;
		state.status = "online";
		localStorage.setItem("login", true);
	},

	register_success(state) {
		state.status = "register";
	},

	user(state, user) {
		state.user = user;
		state.currentUserId = user.user_id;
		state.isLogin = true;
	},

	logout(state) {
		state.user = {};
		state.isLogin = false;
		state.currentUserId = null;
		state.token = "";
		state.status = "offline";
		localStorage.clear();
	},

	profile(state, data) {
		state.newProfile = data;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
