import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";

Vue.use(VueRouter);

const ifNotAuthenticated = (to, from, next) => {
	if (!localStorage.getItem('isLogin')) {
		next();
		return;
	}
	next("/");
};

const ifAuthenticated = (to, from, next) => {
	if (localStorage.getItem('isLogin')) {
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
	},
	{
		path: "/login",
		name: "Login",
		component: Login,
		beforeEnter: ifNotAuthenticated,
	},
	{
		path: "/register",
		name: "Register",
		component: Register,
		beforeEnter: ifNotAuthenticated,
	},
	{
		path: "/profile",
		name: "Profile",
		component: Profile,
		beforeEnter: ifAuthenticated,
	},
];

const router = new VueRouter({
	mode: "history",
	base: process.env.BASE_URL,
	routes,
});

export default router;
