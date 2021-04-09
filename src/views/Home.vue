<template>
	<div
		class="app-container"
		:class="{
			'app-mobile': isDevice,
			'app-mobile-dark': theme === 'dark',
		}"
	>
		<chat-container
			:currentUserId="currentUserId"
			:theme="theme"
			:isDevice="isDevice"
			:filterdLinks="filterdLinks"
			@show-demo-options="showDemoOptions = $event"
			v-if="showChat"
		/>
	</div>
</template>

<script>
import ChatContainer from "./ChatContainer";
import { mapGetters } from "vuex";
import { mdiAccount } from "@mdi/js";
import { mdiHomeAccount, mdiAccountDetails } from "@mdi/js";

export default {
	name: "Home",
	components: {
		ChatContainer,
	},
	data() {
		return {
			theme: "light",
			showChat: true,
			currentUserId: "",
			isDevice: false,
			showDemoOptions: true,
			updatingData: false,
			icons: { mdiAccount },
			links: [
				{ url: "/", name: "Home", icon: mdiHomeAccount },
				{ url: "/profile", name: "Profile", icon: mdiAccountDetails },
				{ url: "/login", name: "Login" },
				{ url: "/register", name: "Register" },
			],
		};
	},
	mounted() {
		this.isDevice = window.innerWidth < 500;
		window.addEventListener("resize", (ev) => {
			if (ev.isTrusted) this.isDevice = window.innerWidth < 500;
		});
	},
	created: function() {
		const token = localStorage.getItem("token");
		if (token) {
			this.$store
				.dispatch("getUser")
				.then(
					() =>
						(this.currentUserId = this.$store.getters.currentUserId)
				)
				.catch((error) => console.log(error));
		} else {
			this.logout();
		}
	},
	computed: {
		showOptions() {
			return !this.isDevice || this.showDemoOptions;
		},
		...mapGetters(["user", "token"]),
		isLogin: function() {
			return this.$store.getters.isLogin ? true : false;
		},
		filterdLinks: function() {
			return this.isLogin
				? this.links.slice(0, 2)
				: this.links.slice(2, 4);
		},
	},
	methods: {
		logout: function() {
			this.$store.dispatch("logout").then(() => {
				this.$router.push("/login");
			});
		},
	},

	watch: {
		currentUserId() {
			this.showChat = false;
			setTimeout(() => (this.showChat = true), 150);
		},
	},
};
</script>

<style lang="scss">
body {
	background: #fafafa;
	margin: 0;
}

input {
	-webkit-appearance: none;
}

.app-container {
	font-family: "Quicksand", sans-serif;
	// padding: 20px 30px 30px;
}

.app-mobile {
	padding: 0;

	&.app-mobile-dark {
		background: #131415;
	}

	.user-logged {
		margin: 10px 5px 0 10px;
	}

	select {
		margin: 10px 0;
	}

	.button-theme {
		margin: 10px 10px 0 0;

		.button-github {
			height: 23px;

			img {
				height: 23px;
			}
		}
	}
}

.user-logged {
	font-size: 12px;
	margin-right: 5px;
	margin-top: 10px;

	&.user-logged-dark {
		color: #fff;
	}
}

select {
	margin-bottom: 20px;
}

.button-theme {
	float: right;
	display: flex;
	align-items: center;

	.button-light {
		background: #fff;
		border: 1px solid #46484e;
		color: #46484e;
	}

	.button-dark {
		background: #1c1d21;
		border: 1px solid #1c1d21;
	}

	button {
		color: #fff;
		outline: none;
		cursor: pointer;
		border-radius: 4px;
		padding: 6px 12px;
		margin-left: 10px;
		border: none;
		font-size: 14px;
		transition: 0.3s;
		vertical-align: middle;

		&.button-github {
			height: 30px;
			background: none;
			padding: 0;
			margin-left: 20px;

			img {
				height: 30px;
			}
		}

		&:hover {
			opacity: 0.8;
		}

		&:active {
			opacity: 0.6;
		}

		@media only screen and (max-width: 768px) {
			padding: 3px 6px;
			font-size: 13px;
		}
	}
}

.version-container {
	padding-top: 20px;
	text-align: right;
	font-size: 14px;
	color: grey;
}
</style>
