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
					<v-icon large>mdi-account-outline</v-icon>
					<div class="caption py-1">Đăng ký</div>
				</div>
				<v-card class="px-4">
					<v-card-text>
						<v-form
							ref="registerForm"
							v-model="valid"
							lazy-validation
						>
							<v-row>
								<v-col cols="12">
									<v-text-field
										v-model="user.username"
										:rules="[rules.required]"
										label="Tên đăng nhập"
										maxlength="20"
										required
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										v-model="user.name"
										label="Tên người dùng"
										required
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										v-model="user.password"
										:append-icon="
											show1 ? 'mdi-eye' : 'mdi-eye-off'
										"
										:rules="[rules.required, rules.min]"
										:type="show1 ? 'text' : 'password'"
										name="input-10-1"
										label="Mật khẩu"
										hint="At least 8 characters"
										counter
										@click:append="show1 = !show1"
									></v-text-field>
								</v-col>
								<v-col cols="12">
									<v-text-field
										block
										v-model="verify"
										:append-icon="
											show1 ? 'mdi-eye' : 'mdi-eye-off'
										"
										:rules="[rules.required, passwordMatch]"
										:type="show1 ? 'text' : 'password'"
										name="input-10-1"
										label="Nhập lại mật khẩu"
										counter
										@click:append="show1 = !show1"
										@keyup.enter="validate"
									></v-text-field>
								</v-col>
								<v-spacer></v-spacer>
								<v-col
									class="d-flex ml-auto"
									cols="12"
									sm="3"
									xsm="12"
								>
									<v-btn
										x-large
										block
										:disabled="!valid"
										color="success"
										@click="validate"
										>Đăng ký</v-btn
									>
								</v-col>
								<v-col cols="12" xsm="12" align-end>
									Bạn đã có tài khoản?
									<v-btn
										color="warning"
										@click="resetValidation"
									>
										<router-link
											to="/login"
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
													>Đăng nhập
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
	name: "Register",
	data() {
		return {
			dialog: true,
			valid: true,
			user: {
				username: "",
				name: "",
				password: "",
			},
			verify: "",
			emailRules: [
				(v) => !!v || "Không được bỏ trống",
				(v) => /.+@.+\..+/.test(v) || "E-mail phải đúng",
			],

			show1: false,
			rules: {
				required: (value) => !!value || "Không được bỏ trống",
				min: (v) => (v && v.length >= 8) || "Có ít nhất 8 ký tự",
			},
		};
	},
	computed: {
		passwordMatch() {
			return () =>
				this.user.password === this.verify || "Mật khẩu phải chính xác";
		},
	},
	methods: {
		validate: function() {
			if (this.$refs.registerForm.validate()) {
				let data = this.user;
				const info = {
					snackText: "Đăng ký thành công",
					snackBool: true,
				};
				this.$store
					.dispatch("register", data)
					.then((res) => {
						if (res.name !== "Error") {
							this.$router.push("/login");
							this.$store.dispatch("addNotification", info);
						}
						else {
							const info = {
								snackText: "Tài khoản đã tồn tại",
								snackBool: true,
							}
							this.$store.dispatch("addNotification", info);
							this.$refs.registerForm.reset();
						}
					})
					.catch((error) => console.log(error));
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

<style scoped>
.bar {
	background-color: #6e7f80;
	text-align: center;
}

.px-4 {
	text-align: center;
}
</style>
