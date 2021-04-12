<template>
	<v-app id="inspire" style="min-height: 100vh;">
		<v-app-bar v-if="isMobile" id="header" color="blue-grey lighten-1" dark>
			<v-toolbar-title>
				<v-avatar> <v-img :src="user.avatar"/></v-avatar>
				{{ user.username }}</v-toolbar-title
			>
			<v-spacer></v-spacer>
			<v-toolbar-items v-for="link in filterdLinks" :key="link.url">
				<v-btn icon>
					<router-link :to="link.url"
						><v-icon>{{ link.icon }}</v-icon></router-link
					>
				</v-btn>
			</v-toolbar-items>
			<v-btn icon>
				<a
					id="logout"
					href="javascript:void(0)"
					@click="$emit('logout')"
				>
					<v-icon>{{ iconLogout }}</v-icon></a
				>
			</v-btn>
		</v-app-bar>

		<router-view />
		<notifications :text="notifications.snackText" />
	</v-app>
</template>

<script lang="ts">
import axios from "axios";
import Notifications from "./components/Notification.vue";
import { mapGetters } from "vuex";
import {
	mdiAccountDetails,
	mdiHomeAccount,
	mdiLogout,
	mdiLogin,
	mdiAccountPlus,
} from "@mdi/js";

export default {
	components: { Notifications },
	data() {
		return {
			data: {
				snackText: "Chào mừng bạn đến với webchat B1Corp",
				snackBool: true,
			},
			links: [
				{ url: "/", name: "Trang chủ", icon: mdiHomeAccount },
				{ url: "/profile", name: "Thông tin", icon: mdiAccountDetails },
				{ url: "/login", name: "Đăng nhập", icon: mdiLogin },
				{ url: "/register", name: "Đăng ký", icon: mdiAccountPlus },
			],
			isMobile: false,
			iconLogout: mdiLogout,
		};
	},
	methods: {
		logout: function() {
			this.$store.dispatch("logout").then(() => {
				this.$router.push("/login");
			});
		},
	},
	mounted() {
		this.isMobile = window.innerWidth < 500;
		window.addEventListener("resize", (ev) => {
			if (ev.isTrusted) this.isMobile = window.innerWidth < 500;
		});
	},
	computed: {
		...mapGetters(["notifications", "user"]),
		isLogin: function() {
			return this.$store.getters.isLogin ? true : false;
		},
		filterdLinks: function() {
			return this.isLogin
				? this.links.slice(0, 2)
				: this.links.slice(2, 4);
		},
	},

	created: function() {
		axios.interceptors.response.use(
			(response) => {
				return response;
			},
			(error) => {
				if (error.response.status === 401) {
					var data = {
						snackText: "Phiên đăng nhập hết hạn",
						snackBool: true,
					};
					this.$store.dispatch("addNotification", data);
					this.$store.dispatch("logout");
					this.$router.push("/login");
				}
				return error;
			}
		);

		this.$store.dispatch("addNotification", this.data);

		window.onclose = function(e) {
			console.log(e);
			window.localStorage.clear();
			this.$store.dispatch("logout");
			this.$router.push("/login");
		};
	},
};
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #8ebeee;
}

#inspire {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: left;
	display: flex;
	color: #8ebeee;
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
