<template>
	<div id="app">
		<v-app id="container">
			<v-footer color="light-blue darken-1" padless>
				<Header
					@logout="logout"
					:links="filterdLinks"
					:isLogin="isLogin"
				/>
			</v-footer>
			<router-view />
			<notifications :text="notifications.snackText" />
		</v-app>
	</div>
</template>

<script lang="ts">
import axios from "axios";
import Notifications from "./components/Notification.vue";
import Header from "./views/Header.vue";
import { mapGetters } from "vuex";

export default {
	components: { Notifications, Header },
	destroyed() {
		this.logout();
	},
	data() {
		return {
			links: [
				{ url: "/", name: "Home" },
				{ url: "/profile", name: "Profile" },
				{ url: "/login", name: "Login" },
				{ url: "/register", name: "Register" },
			],
			data: {
				snackText: "Chào mừng bạn đến với webchat B1Corp",
				snackBool: true,
			},
		};
	},
	methods: {
		logout: function() {
			this.$store.dispatch("logout").then(() => {
				this.$router.push("/login");
			});
		},
	},
	computed: {
		isLogin: function() {
			return this.$store.getters.isLogin ? true : false;
		},
		filterdLinks: function() {
			return this.isLogin
				? this.links.slice(0, 2)
				: this.links.slice(2, 4);
		},
		...mapGetters(["notifications"]),
	},

	mounted: function() {
		window.onbeforeunload = function(e) {
			console.log(e);
			var storage = window.localStorage;
			storage.clear();
		};
	},
	created: function() {
		axios.interceptors.response.use(undefined, function(err) {
			return new Promise(function(resolve, reject) {
				if (
					err.status === 401 &&
					err.config &&
					!err.config.__isRetryRequest
				) {
					this.$store.dispatch("logout");
					resolve(true);
					this.$router.push("/login");
				}
				reject(err);
				throw err;
			});
		});

		this.$store.dispatch("addNoitionalData", this.data);
	},
};
</script>

<style lang="scss" scoped>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #8ebeee;
}

#container {
	background-color: #1b96e7;
	a {
		font-weight: bold;
		color: #000000;
		text-decoration: none;

		&.router-link-exact-active {
			color: #eaf5f0;
		}
	}
}

.my-2 {
	min-height: 0;
}
</style>
