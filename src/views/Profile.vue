<template>
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
									<h2>Thông tin {{ user.username }}</h2>
									id: {{ user.user_id }}
								</v-col>
								<v-col cols="12">
									<v-text-field
										label="Tên đăng nhập"
										v-model="username"
										required
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										label="Tên người dùng"
										v-model="name"
										required
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										label="Đường dẫn ảnh đại diện"
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
							Đóng
						</v-btn>
						<v-btn color="blue darken-1" text @click="save">
							Cập nhập
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>
		</v-row>
	</v-app>
</template>

<script>
import { mapGetters } from "vuex";

export default {
	name: "Profile",
	data: () => ({
		dialog: true,
		username: "",
		name: "",
		avatar_url: "",
	}),
	async created() {
		const token = this.token;
		if (token) {
			this.username = this.user.username;
			this.name = this.user.name;
			this.avatar_url = this.user.avatar;
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
			let data = {
				username: this.username,
				name: this.name,
				avatar: this.avatar_url,
			};

			this.$store
				.dispatch("changeProfile", data)
				.then(() =>
					this.$router.push("/").catch((err) => console.log(err))
				);
		},
	},
};
</script>

<style scoped>
#inspire {
	text-align: center;
}
</style>