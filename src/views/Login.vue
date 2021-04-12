<template>
	<v-app>
		<v-dialog
			v-model="dialog"
			persistent
			max-width="600px"
			min-width="360px"
		>
			<div>
				<div class="bar">
					<v-icon large>mdi-account</v-icon>
					<div class="caption py-1">Đăng nhập</div>
				</div>

				<v-card class="px-4">
					<v-card-text>
						<v-form ref="loginForm" v-model="valid" lazy-validation>
							<v-row>
								<v-col cols="12">
									<v-text-field
										v-model="user.loginUsername"
										label="Tên đăng nhập"
										required
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										v-model="user.loginPassword"
										:append-icon="show1 ? 'eye' : 'eye-off'"
										:rules="[rules.required, rules.min]"
										:type="show1 ? 'text' : 'password'"
										name="input-10-1"
										label="Mật khẩu"
										hint="Ít nhất 8 ký tự"
										counter
										@click:append="show1 = !show1"
									></v-text-field>
								</v-col>
								<v-col class="d-flex" cols="12" sm="6" xsm="12">
								</v-col>
								<v-spacer></v-spacer>
								<v-col
									class="d-flex"
									cols="12"
									sm="3"
									xsm="12"
									align-end
								>
									<v-btn
										large
										block
										:disabled="!valid"
										color="success"
										@click="validate"
									>
										Đăng nhập
									</v-btn>
								</v-col>
								<v-col class="align" cols="12" xsm="12" align-end>
									Chưa có tài khoản ?
									<v-btn
										color="warning"
										@click="resetValidation"
									>
										<router-link
											to="/register"
											custom
											v-slot="{
												href,
												navigate,
												isActive,
												isExactActive,
											}"
										>
											<li
												:class="[
													isActive &&
														'router-link-active',
													isExactActive &&
														'router-link-exact-active',
												]"
											>
												<a
													:href="href"
													class="text"
													@click="navigate"
													>Đăng ký
												</a>
											</li>
										</router-link>
									</v-btn>
								</v-col>
							</v-row>
						</v-form>
					</v-card-text>
				</v-card>
			</div>
		</v-dialog>
	</v-app>
</template>

<script>
export default {
	name: "Login",
	data: () => ({
		dialog: true,
		valid: true,
		user: {
			loginPassword: "",
			loginUsername: "",
		},
		textLogin: "Đăng nhập thành công",
		login: false,

		show1: false,
		rules: {
			required: (value) => !!value || "Không được bỏ trống",
			min: (v) => (v && v.length >= 8) || "Ít nhất 8 ký tự",
		},
	}),
	methods: {
		validate: function() {
			if (this.$refs.loginForm.validate()) {
				let user = {
					username: this.user.loginUsername,
					password: this.user.loginPassword,
				};
				const data = {
					snackText: `Chào mừng ${this.user.loginUsername}`,
					snackBool: true,
				};
				this.$store
					.dispatch("login", user)
					.then(() => {
						this.$router.push("/");
						this.$store.dispatch("addNotification", data);
					})
					.catch((err) => console.log(err));
				this.login = true;
			}
		},
		reset() {
			this.$refs.form.reset();
		},
		resetValidation() {
			this.$refs.form.resetValidation();
		},
	},
};
</script>

<style lang="scss" scoped>
.align {
	text-align: center;
}

.bar {
	background-color: #6e7f80;
	text-align: center;
}
li > a.text {
	text-decoration: none;
	color: white;
}
li {
	list-style-type: none;
	color: white;
}
</style>
