import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
// import store from "../store"

Vue.use(VueRouter);

const ifNotAuthenticated = (to, from, next) => {
	if (!localStorage.getItem("isLogin")) {
		next();
		return;
	}
	next("/");
};

const ifAuthenticated = (to, from, next) => {
	if (localStorage.getItem("isLogin")) {
		next();
		return;
	}
	next("/login");
};

const routes = [
	{
		path: "/",
		name: "Home",
		component: Home,
		beforeEnter: ifAuthenticated,
		meta: {
			title: "Home Chat Page",
		},
	},
	{
		path: "/login",
		name: "Login",
		component: Login,
		beforeEnter: ifNotAuthenticated,
		meta: {
			title: "Login",
		},
	},
	{
		path: "/register",
		name: "Register",
		component: Register,
		beforeEnter: ifNotAuthenticated,
		meta: {
			title: "Register",
		},
	},
	{
		path: "/profile",
		name: "Profile",
		component: Profile,
		beforeEnter: ifAuthenticated,
		meta: {
			title: "Profile",
		},
	},
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

const DEFAULT_TITLE = "B1Corp webchat";
// eslint-disable-next-line no-unused-vars
router.afterEach((to, from) => {
	Vue.nextTick(() => {
		document.title = to.meta.title || DEFAULT_TITLE;
	});
});

export default router;
