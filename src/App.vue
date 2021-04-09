<template>
	<v-app id="inspire" style="min-height: 100vh;">
		<router-view />
		<notifications :text="notifications.snackText" />
	</v-app>
</template>

<script lang="ts">
import axios from "axios";
import Notifications from "./components/Notification.vue";
import { mapGetters } from "vuex";

export default {
	components: { Notifications },
	data() {
		return {
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
		...mapGetters(["notifications"]),
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
