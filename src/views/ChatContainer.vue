<template>
	<div class="window-container" :class="{ 'window-mobile': isDevice }">
		<form @submit.prevent="createRoom" v-if="addNewRoom">
			<input
				type="text"
				placeholder="Add username"
				v-model="addRoomUsername"
			/>
			<button type="submit" :disabled="disableForm || !addRoomUsername">
				Create Room
			</button>
			<button class="button-cancel" @click="addNewRoom = false">
				Cancel
			</button>
		</form>

		<form @submit.prevent="addRoomUser" v-if="inviteRoomId">
			<input
				type="text"
				placeholder="Add username"
				v-model="invitedUsername"
			/>
			<button type="submit" :disabled="disableForm || !invitedUsername">
				Add User
			</button>
			<button class="button-cancel" @click="inviteRoomId = null">
				Cancel
			</button>
		</form>

		<form @submit.prevent="deleteRoomUser" v-if="removeRoomId">
			<input
				type="text"
				placeholder="enter username remove"
				v-model="removeUserName"
			/>
			<button type="submit" :disabled="disableForm || !removeUserName">
				Remove User
			</button>
			<button class="button-cancel" @click="removeRoomId = null">
				Cancel
			</button>
		</form>

		<chat-window
			:height="screenHeight"
			:theme="theme"
			:styles="styles"
			:current-user-id="currentUserId"
			:room-id="roomId"
			:rooms="list_rooms"
			:loading-rooms="loadingRooms"
			:messages="messages"
			:messages-loaded="messagesLoaded"
			:rooms-loaded="roomsLoaded"
			:room-actions="roomActions"
			:menu-actions="menuActions"
			:room-message="roomMessage"
			@fetch-more-rooms="fetchMoreRooms"
			@fetch-messages="fetchMessages"
			@send-message="sendMessage"
			@edit-message="editMessage"
			@delete-message="deleteMessage"
			@open-file="openFile"
			@add-room="addRoom"
			@room-action-handler="menuActionHandler"
			@menu-action-handler="menuActionHandler"
			@toggle-rooms-list="$emit('show-demo-options', $event.opened)"
		>
		</chat-window>
	</div>
</template>

<script>
import ChatWindow from "../ChatWindow";
import { mapGetters } from "vuex";
import { parseTimestamp, isSameDay } from "@/utils/dates";

export default {
	name: "ChatContainer",
	components: {
		ChatWindow,
	},

	props: ["currentUserId", "theme", "isDevice"],

	data() {
		return {
			roomsPerPage: 15,
			list_rooms: [],
			roomId: "",
			roomsLoaded: false,
			loadingRooms: true,
			selectedRoom: null,
			messagesPerPage: 10,
			messages: [],
			messagesLoaded: false,
			roomMessage: "",
			roomsListeners: [1],
			listeners: [],
			disableForm: false,
			addNewRoom: null,
			addRoomUsername: "",
			inviteRoomId: null,
			invitedUsername: "",
			removeRoomId: null,
			removeUserName: "",
			removeUsers: [],
			roomActions: [
				{ name: "inviteUser", title: "Invite User" },
				{ name: "removeUser", title: "Remove User" },
				{ name: "deleteRoom", title: "Delete Room" },
			],
			menuActions: [
				{ name: "inviteUser", title: "Invite User" },
				{ name: "removeUser", title: "Remove User" },
				{ name: "deleteRoom", title: "Delete Room" },
			],
			styles: { container: { borderRadius: "4px" } },
		};
	},

	mounted() {
		try {
			this.fetchRooms();
			this.updateUserOnlineStatus();
		} catch (error) {
			console.log("listener is not error");
		}
	},

	destroyed() {
		try {
			this.resetRooms();
		} catch (error) {
			console.log("listener is not error");
		}
	},

	computed: {
		screenHeight() {
			return this.isDevice
				? window.innerHeight + "px"
				: "calc(100vh - 80px)";
		},
		...mapGetters([
			"user",
			"token",
			"rooms",
			"listMessages",
			"lastMessage",
			"newMessage",
		]),
	},
	async created() {
		await this.fetchMoreRooms();
	},

	methods: {
		resetRooms() {
			this.loadingRooms = true;
			this.list_rooms = [];
			this.roomsLoaded = true;
			this.roomsListeners.forEach((listener) => listener());
			this.roomsListeners = [];
			this.resetMessages();
		},

		resetMessages() {
			this.messages = [];
			this.messagesLoaded = false;
			this.listeners.forEach((listener) => listener());
			this.listeners = [];
		},

		fetchRooms() {
			this.resetRooms();
			this.fetchMoreRooms();
		},

		async fetchMoreRooms() {
			await this.$store
				.dispatch("fetchAllRooms")
				.then(() => (this.list_rooms = this.rooms));
		},

		async fetchMessages({ room, options = {} }) {
			this.$emit("show-demo-options", false);
			if (options.reset) this.resetMessages();

			this.selectedRoom = room.roomId;
			await this.$store
				.dispatch("fetchRoomMessage", room.roomId)
				.then(() => (this.messages = this.listMessages));
			this.messagesLoaded = this.$store.getters.messagesLoaded;
		},

		async sendMessage({ content, roomId }) {
			await this.$store
				.dispatch("sendMessages", { content, roomId })
				.then(() => {
					this.messages = this.messages.concat(this.newMessage);

					for (const room of this.list_rooms) {
						if (room.roomId === roomId) {
							room.lastMessage = this.$store.getters.lastMessage;
						}
					}
				})
				.catch((error) => console.error(error));
		},

		openFile({ message }) {
			window.open(message.file.url, "_blank");
		},

		formatTimestamp(date, timestamp) {
			const timestampFormat = isSameDay(date, new Date())
				? "HH:mm"
				: "DD/MM/YY";
			const result = parseTimestamp(timestamp, timestampFormat);
			return timestampFormat === "HH:mm" ? `Today, ${result}` : result;
		},

		async editMessage({ messageId, newContent }) {
			await this.$store.dispatch("editMessage", {
				messageId,
				newContent,
			});
			const messContent = this.$store.getters.editMessageContent;
			const messId = this.$store.getters.editMessageId;

			this.messages.filter(function(mess) {
				if (mess._id === messId) {
					mess.content = messContent;
				}
			});

			if (messId === this.messages[this.messages.length - 1]._id) {
				const lastMessage = {
					content: messContent,
					senderId: this.user.user_id,
					username: this.user.username,
					timestamp: this.formatTimestamp(new Date(), new Date()),
					saved: true,
					seen: true,
					new: true,
				};
				const roomId = this.$store.getters.idRoom;
				this.list_rooms.filter(function(room) {
					if (room.roomId === roomId) {
						room.lastMessage = lastMessage;
					}
				});
			}
		},

		async deleteMessage({ message }) {
			await this.$store.dispatch("deleteMessage", message);
			const index = this.$store.getters.deleteMessage.index;
			this.messages.splice(index, 1);

			const roomId = this.$store.getters.idRoom;
			const lastMessage = this.messages[this.messages.length - 1];
			const format_lastMessage = {
				content: lastMessage.content,
				senderId: lastMessage.senderId,
				username: lastMessage.username,
				timestamp: lastMessage.timestamp,
				saved: true,
				seen: lastMessage.seen,
			};
			this.list_rooms.filter(function(room) {
				if (room.roomId === roomId) {
					room.lastMessage = format_lastMessage;
				}
			});
		},

		menuActionHandler({ action, roomId }) {
			switch (action.name) {
				case "inviteUser":
					return this.inviteUser(roomId);
				case "removeUser":
					return this.removeUser(roomId);
				case "deleteRoom":
					return this.deleteRoom(roomId);
			}
		},

		addRoom() {
			this.resetForms();
			this.addNewRoom = true;
		},

		async createRoom() {
			this.disableForm = true;

			await this.$store
				.dispatch("createRoom", this.addRoomUsername)
				.then(() => {
					this.addNewRoom = false;
					this.addRoomUsername = "";
					this.fetchRooms();
				})
				.catch((err) => console.error(err));
		},

		inviteUser(roomId) {
			this.resetForms();
			this.inviteRoomId = roomId;
		},

		async addRoomUser() {
			this.disableForm = true;
			const memberName = this.invitedUsername;
			const roomId = this.inviteRoomId;
			await this.$store
				.dispatch("addUser", { roomId, memberName })
				.then(() => {
					this.inviteRoomId = null;
					this.invitedUsername = "";
					this.fetchRooms();
				})
				.catch((err) => console.log(err));
		},

		removeUser(roomId) {
			this.resetForms();
			this.removeRoomId = roomId;
			this.removeUsers = this.rooms.find(
				(room) => room.roomId === roomId
			).users;
		},

		async deleteRoomUser() {
			this.disableForm = true;
			const roomId = this.removeRoomId;
			const userName = this.removeUserName;
			await this.$store
				.dispatch("removeUser", { roomId, userName })
				.then(() => {
					this.removeRoomId = null;
					this.removeUserName = "";
					this.fetchRooms();
				})
				.catch((err) => console.log(err));
		},

		async deleteRoom(roomId) {
			await this.$store
				.dispatch("removeRoom", { roomId })
				.then(() => {
					this.fetchRooms();
					alert("delete success");
				})
				.catch((err) => console.log(err));
		},

		resetForms() {
			this.disableForm = false;
			this.addNewRoom = null;
			this.addRoomUsername = "";
			this.inviteRoomId = null;
			this.invitedUsername = "";
			this.removeRoomId = null;
			this.removeUserName = "";
		},
	},
};
</script>

<style lang="scss" scoped>
.window-container {
	width: 100%;
}

.window-mobile {
	form {
		padding: 0 10px 10px;
	}
}

form {
	padding-bottom: 20px;
}

input {
	padding: 5px;
	width: 140px;
	height: 21px;
	border-radius: 4px;
	border: 1px solid #d2d6da;
	outline: none;
	font-size: 14px;
	vertical-align: middle;

	&::placeholder {
		color: #9ca6af;
	}
}

button {
	background: #1976d2;
	color: #fff;
	outline: none;
	cursor: pointer;
	border-radius: 4px;
	padding: 8px 12px;
	margin-left: 10px;
	border: none;
	font-size: 14px;
	transition: 0.3s;
	vertical-align: middle;

	&:hover {
		opacity: 0.8;
	}

	&:active {
		opacity: 0.6;
	}

	&:disabled {
		cursor: initial;
		background: #c6c9cc;
		opacity: 0.6;
	}
}

.button-cancel {
	color: #a8aeb3;
	background: none;
	margin-left: 5px;
}

select {
	vertical-align: middle;
	height: 33px;
	width: 152px;
	font-size: 13px;
	margin: 0 !important;
}
</style>
