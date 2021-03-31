<template>
	<div id="app">
		<div id="nav">
			<router-link to="/" v-if="isLogin">Home |</router-link>
			<router-link to="/login" v-if="!isLogin">Login |</router-link>
			<router-link to="/register" v-if="!isLogin">Register |</router-link>
			<router-link to="/profile" v-if="isLogin">Profile |</router-link>
			<a href="javascript:void(0)" @click="logout" v-if="isLogin">
				Logout</a
			>
		</div>
		<router-view />
	</div>
</template>

<script lang="ts">
import axios from "axios";
export default {
	beforeDestroy() {
		this.logout();
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
			return this.$store.getters.isLogin;
		},
	},
	created: function() {
		axios.interceptors.response.use(undefined, function(err) {
			return new Promise(function(resolve, reject) {
				if (
					err.status === 401 &&
					err.config &&
					!err.config.__isRetryRequest
				) {
					this.$store.dispatch('logout');
					resolve(true);
					this.$router.push("/login");
				}
				reject(err);
				throw err;
			});
		});
	},
};
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#nav {
	padding: 30px;
	a {
		font-weight: bold;
		color: #2c3e50;
		text-decoration: none;

		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
