<template>
	<div id="app">
		<div class="text-center">
			<v-snackbar
				v-model="notifications.snackBool"
				:top="top"
				rounded="pill"
				color="blue-grey"
				:timeout="timeout"
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
			top: true,
			snackbar: true,
		};
	},
};
</script>
