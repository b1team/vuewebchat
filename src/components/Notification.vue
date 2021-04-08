<template>
	<div id="app">
		<div class="text-center">
			<v-snackbar
				v-model="notifications.snackBool"
				:bottom="bool"
				:right="bool"
				color="blue-grey"
				:timeout="timeout"
				class="text-center"
			>
				{{ text }}
			</v-snackbar>
		</div>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
	name: "Notifications",
	props: ["text"],
	computed: { ...mapGetters(["notifications"]) },
	data() {
		return {
			timeout: 2000,
			bool: true,
			snackbar: true,
		};
	},
};
</script>

<style scoped>
.text-center {
	text-align: center;
	align-content: center;
}
</style>
