import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import Header from "../views/Header.vue";
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
			title: "Phòng chat",
		},
	},
	{
		path: "/login",
		name: "Login",
		component: Login,
		beforeEnter: ifNotAuthenticated,
		meta: {
			title: "Đăng nhập",
		},
	},
	{
		path: "/register",
		name: "Register",
		component: Register,
		beforeEnter: ifNotAuthenticated,
		meta: {
			title: "Đăng ký",
		},
	},
	{
		path: "/profile",
		name: "Profile",
		component: Profile,
		beforeEnter: ifAuthenticated,
		meta: {
			title: "Hồ sơ",
		},
	},
	{
		path: "/header",
		name: "Header",
		component: Header,
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
