<template>
	<div id="app">
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
						<div class="caption py-1">Login</div>
					</div>

					<v-card class="px-4">
						<v-card-text>
							<v-form
								ref="loginForm"
								v-model="valid"
								lazy-validation
							>
								<v-row>
									<v-col cols="12">
										<v-text-field
											v-model="user.loginUsername"
											label="Username"
											required
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-text-field
											v-model="user.loginPassword"
											:append-icon="
												show1 ? 'eye' : 'eye-off'
											"
											:rules="[rules.required, rules.min]"
											:type="show1 ? 'text' : 'password'"
											name="input-10-1"
											label="Password"
											hint="At least 8 characters"
											counter
											@click:append="show1 = !show1"
										></v-text-field>
									</v-col>
									<v-col
										class="d-flex"
										cols="12"
										sm="6"
										xsm="12"
									>
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
											Login
										</v-btn>
									</v-col>
									<v-col cols="12" xsm="12" align-end>
										Don't have account ?
										<v-btn
											color="warning"
											@click="resetValidation"
										>
											<router-link
												to="/register"
												custom
												v-slot="{
													href,
													route,
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
														>{{ route.fullPath }}</a
													>
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
	</div>
</template>

<script>
import axios from "axios";

export default {
	name: "Login",
	computed: {},
	data: () => ({
		dialog: true,
		valid: true,
		user: {
			loginPassword: "",
			loginUsername: "",
		},

		show1: false,
		rules: {
			required: (value) => !!value || "Required.",
			min: (v) => (v && v.length >= 8) || "Min 8 characters",
		},
	}),
	methods: {
		async validate() {
			if (this.$refs.loginForm.validate()) {
				// submit form to server/API here...
				await axios
					.post("token", {
						username: this.user.loginUsername,
						password: this.user.loginPassword,
					})
					.then((response) => {
						localStorage.setItem("token", response.data.access_token);
						this.$store.commit('token', response.data.access_token);
						this.$store.commit('isLogin', true);
						localStorage.setItem("isLogin", true);
						this.$router.push("/");
					})
					.catch((error) => {
						console.log(error);
					})
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

<style>
.bar {
	background-color: rgb(200, 233, 200);
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
