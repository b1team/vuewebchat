<template>
	<v-row id="header" justify="center" no-gutters>
		<v-btn
			color="white"
			v-for="link in links"
			:key="link.url"
			text
			rounded
			class="my-2"
		>
			<router-link :to="link.url" exact-path>{{ link.name }}</router-link>
		</v-btn>
		<v-btn color="white" text rounded class="my-2" v-if="isLogin">
			<a id="logout" href="javascript:void(0)" @click="$emit('logout')">
				Logout</a
			>
		</v-btn>
	</v-row>
</template>

<script>
export default {
	props: ["links", "isLogin"],
};
</script>

<style lang="scss" scoped>
#header {
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
</style>
