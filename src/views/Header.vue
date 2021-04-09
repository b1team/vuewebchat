<template>
	<v-card id="header">
		<v-navigation-drawer
			id="header"
			v-model="drawer"
			:mini-variant.sync="mini"
			permanent
			color="blue-grey lighten-1"
		>
			<v-list-item class="px-2">
				<v-list-item-avatar>
					<v-img :src="user.avatar"></v-img>
				</v-list-item-avatar>

				<v-list-item-title>{{ user.username }}</v-list-item-title>

				<v-btn icon @click.stop="mini = !mini">
					<v-icon>mdi-chevron-left</v-icon>
				</v-btn>
			</v-list-item>

			<v-divider></v-divider>

			<v-list dense color="blue-grey lighten-1">
				<v-list-item v-for="link in links" :key="link.url" link>
					<v-list-item-icon>
						<v-icon color="white">{{ link.icon }}</v-icon>
					</v-list-item-icon>

					<v-list-item-content>
						<v-list-item-title>
							<router-link :to="link.url" exact-path>{{
								link.name
							}}</router-link>
						</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
				<v-list-item>
					<v-list-item-icon>
						<v-icon color="white">{{ iconLogout }}</v-icon>
					</v-list-item-icon>
					<v-list-item-content>
						<v-list-item-title
							><a
								id="logout"
								href="javascript:void(0)"
								@click="$emit('logout')"
							>
								Logout</a
							></v-list-item-title
						>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</v-navigation-drawer>
	</v-card>
</template>

<script>
export default {
	props: ["links", "user", "iconDetails", "iconLogout"],
	data() {
		return {
			drawer: true,
			mini: true,
		};
	},
};
</script>

<style scoped>
#header {
	border-top-left-radius: 0 !important;
	border-top-right-radius: 0 !important;
	border-bottom-left-radius: 0 !important;
	border-bottom-right-radius: 0 !important;
}
</style>
