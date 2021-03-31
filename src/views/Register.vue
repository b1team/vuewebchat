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
						<v-icon large>mdi-account-outline</v-icon>
						<div class="caption py-1">Register</div>
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
											label="Username"
											maxlength="20"
											required
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-text-field
											v-model="user.name"
											label="Name"
											required
										></v-text-field>
									</v-col>
									<v-col cols="12">
										<v-text-field
											v-model="user.password"
											:append-icon="
												show1
													? 'mdi-eye'
													: 'mdi-eye-off'
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
									<v-col cols="12">
										<v-text-field
											block
											v-model="verify"
											:append-icon="
												show1
													? 'mdi-eye'
													: 'mdi-eye-off'
											"
											:rules="[
												rules.required,
												passwordMatch,
											]"
											:type="show1 ? 'text' : 'password'"
											name="input-10-1"
											label="Confirm Password"
											counter
											@click:append="show1 = !show1"
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
											>Register</v-btn
										>
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
// import axios from "axios";

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
				(v) => !!v || "Required",
				(v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
			],

			show1: false,
			rules: {
				required: (value) => !!value || "Required.",
				min: (v) => (v && v.length >= 8) || "Min 8 characters",
			},
		};
	},
	computed: {
		passwordMatch() {
			return () =>
				this.user.password === this.verify || "Password must match";
		},
	},
	methods: {
		validate: function() {
			if (this.$refs.registerForm.validate()) {
				let data = this.user;
				this.$store
					.dispatch("register", data)
					.then(() => this.$router.push("/login"))
					.catch((error) => console.log(error))
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
	background-color: rgb(200, 233, 200);
}
</style>
