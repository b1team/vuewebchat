<template>
	<div id="app">
		<div id="nav">
			<router-link to="/">Home</router-link> |
			<router-link to="/login" v-if="!isLogin" >Login | </router-link>
			<router-link to="/register" v-if="!isLogin" >Register | </router-link>
			<router-link to="/profile">Profile</router-link> |
			<a href="javascript:void(0)" @click="logout" v-if="isLogin"> Logout</a>
		</div>
		<router-view/>
	</div>
</template>

<script lang="ts">
import {mapGetters} from 'vuex';

export default {
	methods: {
		logout() {
			localStorage.removeItem('token');
			this.$store.dispatch('token', null);
			localStorage.removeItem('user');
			this.$store.commit('user', {});
			this.$store.dispatch('isLogin', false);
			localStorage.removeItem('isLogin');
			this.$router.push("/login")
		}
	},
	computed: {
		...mapGetters(['isLogin']),
	}
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

		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
