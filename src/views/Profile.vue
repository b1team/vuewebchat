<template>
	<div id="app">
		<v-app id="inspire">
			<v-row justify="center">
				<v-dialog v-model="dialog" persistent max-width="600px">
					<v-card>
						<v-card-text>
							<v-container>
								<v-row>
									<v-col cols="12" sm="6" md="4">
										<v-avatar size="150">
											<v-img
												max-height="250"
												max-width="350"
												:src="avatar_url"
											></v-img>
										</v-avatar>
									</v-col>
									<v-col cols="12" sm="6" md="4">
										<h2>{{ user.username }} Profile</h2>
										id: {{ user.user_id }}
									</v-col>
									<v-col cols="12">
										<v-text-field
											label="Username"
											v-model="username"
											required
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-text-field
											label="Name"
											v-model="name"
											required
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-text-field
											label="Avatar url"
											v-model="avatar_url"
											required
										></v-text-field>
									</v-col>
								</v-row>
							</v-container>
						</v-card-text>
						<v-card-actions>
							<v-spacer></v-spacer>
							<v-btn color="blue darken-1" text @click="close">
								Close
							</v-btn>
							<v-btn color="blue darken-1" text @click="save">
								Save
							</v-btn>
						</v-card-actions>
					</v-card>
				</v-dialog>
			</v-row>
		</v-app>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import axios from "axios";

export default {
	name: "Profile",
	data: () => ({
		dialog: true,
		username: "",
		name: "",
		avatar_url: "",
	}),
	async created() {
		console.log(this.$store.getters.isLogin);
		const token = localStorage.getItem("token");
		if (token) {
			await axios
				.get("users/me", { Authorization: this.token })
				.then((response) => {
					this.$store.commit("user", response.data);
					this.$store.commit("isLogin", true);
					console.log(response.data);
					this.username = response.data.username;
					this.name = response.data.name;
					this.avatar_url = response.data.avatar;
				})
				.catch((error) => {
					console.log(error);
				});
		}
	},
	computed: {
		...mapGetters(["user", "token"]),
	},
	methods: {
		close() {
			this.$router.push("/");
		},
		async save() {
			await axios.put("users",{ 
				username: this.username,
				name: this.name,
				avatar: this.avatar_url,
				Authorization: this.token
			})
			.then((response) => {
				console.log(response);
				this.$router.push("/");
			})
			.catch((error) => {
				console.log(error);
			})
		},
	},
};
</script>

<style></style>
