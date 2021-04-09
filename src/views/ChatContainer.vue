<template>
	<div class="window-container" :class="{ 'window-mobile': isDevice }">
		<v-dialog v-model="dialogRemove" max-width="290">
			<v-card>
				<v-card-title class="headline">
					Want to get out?
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>

					<v-btn
						color="white darken-1"
						text
						@click="dialogRemove = false"
					>
						Disagree
					</v-btn>

					<v-btn color="white darken-1" text @click="getOut">
						Agree
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

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

		<v-dialog v-model="dialog" persistent max-width="290">
			<v-card>
				<v-card-title class="headline">
					Input room name
				</v-card-title>
				<v-card-text>
					<v-text-field
						v-model="addRoomUsername"
						label="Room name"
						required
					></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="white darken-1" text @click="dialog = false">
						Cancel
					</v-btn>
					<v-btn color="white darken-1" text @click="createRoom">
						Create room
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialogRoom" persistent max-width="290">
			<v-card>
				<v-card-title class="headline">
					Room detail
				</v-card-title>
				<v-card-text>
					<v-text-field
						label="Room name"
						v-model="roomName"
						required
					></v-text-field>
					<v-text-field
						label="Room avatar"
						v-model="roomAvatar"
						required
					></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="white darken-1"
						text
						@click="dialogRoom = false"
					>
						Cancel
					</v-btn>
					<v-btn color="white darken-1" text @click="updateRoomInfo">
						Update room
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

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
			:filterdLinks="filterdLinks"
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

	props: ["currentUserId", "theme", "isDevice", "filterdLinks"],

	data() {
		return {
			roomsPerPage: 15,
			list_rooms: [],
			roomId: "",
			roomsLoaded: false,
			loadingRooms: false,
			selectedRoom: null,
			messagesPerPage: 10,
			messages: [],
			messagesLoaded: false,
			roomMessage: "",
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
				{ name: "getoutRoom", title: "Get out Room" },
				{ name: "updateRoom", title: "Update Room" },
			],
			styles: { container: { borderRadius: "4px" } },
			connection: null,
			snackBool: false,
			snackText: "",
			dialog: false,
			dialogRemove: false,
			getoutRoomId: null,
			dialogRoom: false,
			roomName: "",
			roomAvatar: "",
			updateRoomId: null,
		};
	},

	mounted() {
		try {
			this.fetchRooms();
			this.snackText = "Đăng nhập thành công";
			this.snackBool = true;
			// this.updateUserOnlineStatus();
		} catch (error) {
			return;
		}
	},

	destroyed() {
		try {
			this.resetRooms();
		} catch (error) {
			return;
		}
	},

	computed: {
		screenHeight() {
			return this.isDevice
				? window.innerHeight + "px"
				: window.innerHeight + "px";
		},
		...mapGetters([
			"user",
			"token",
			"rooms",
			"listMessages",
			"lastMessage",
			"newMessage",
			"roomInfo",
		]),
	},
	async created() {
		this.fetchMoreRooms();
		this.socketSend();
	},

	methods: {
		resetRooms() {
			this.loadingRooms = true;
			this.list_rooms = [];
			this.roomsLoaded = true;
			this.resetMessages();
		},

		resetMessages() {
			this.messages = [];
			this.messagesLoaded = false;
		},

		fetchRooms() {
			this.resetRooms();
			this.fetchMoreRooms();
		},

		message_is_exist: function(message) {
			var message_id = message.id;
			for (const message of this.messages)
				if (message_id === message._id) return true;
			return false;
		},

		async fetchMoreRooms() {
			await this.$store
				.dispatch("fetchAllRooms")
				.then(() => (this.list_rooms = this.rooms));
		},

		async fetchMessages({ room, options = {} }) {
			this.$emit("show-demo-options", false);
			if (options.reset) this.resetMessages();
			console.log(room)

			this.selectedRoom = room.roomId;
			var roomId = this.selectedRoom;
			const roomInfo = {
				roomName: room.roomName,
				avatar: room.avatar ? room.avatar : " ",
			};
			await this.$store
				.dispatch("fetchRoomMessage", { roomId, roomInfo })
				.then(() => (this.messages = this.listMessages));
			this.messagesLoaded = false;
		},

		async sendMessage({ content, roomId }) {
			const username = this.user.username;
			await this.$store
				.dispatch("sendMessages", { content, roomId, username })
				.then(() => {
					this.connection.send(JSON.stringify(this.newMessage));

					for (const room of this.list_rooms) {
						if (room.roomId === roomId) {
							room.lastMessage = this.$store.getters.lastMessage;
						}
					}
				})
				.catch((error) => console.error(error));
		},

		socketSend: function() {
			this.connection = new WebSocket(
				`${process.env.VUE_APP_CHAT_WS}?token=` + this.token
			);

			this.connection.vue = this;
			this.connection.onmessage = function(event) {
				//push message
				event.preventDefault();
				var data = JSON.parse(event.data);
				var message = data.payload;
				if (this.vue.message_is_exist(message)) {
					return;
				}
				message["_id"] = message["message_id"];
				message["senderId"] = message["sender_id"];
				message["timestamp"] =
					new Date(message.created_at).addHours(7).getHours() +
					":" +
					new Date(message.created_at).getMinutes();
				this.vue.messages.push(message);
				// notification new message

				this.vue.sendNotification({
					userId: this.vue.currentUserId,
					title: `New message from ${this.vue.roomInfo.roomName}`,
					message: message["username"] + ": " + message["content"],
					icon:
						"https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png",
					clickCallback: function() {
						alert("do something when clicked on notification");
					},
				});
			};

			// eslint-disable-next-line no-unused-vars
			this.connection.onerror = function(event) {
				alert("Connection Error");
				this.vue.$store.dispatch("logout");
				this.vue.$router.push("/login");
			};

			this.connection.onopen = function(event) {
				event.preventDefault();
				console.log("Connected");
			};
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
				case "getoutRoom":
					return this.getoutRoom(roomId);
				case "updateRoom":
					return this.updateRoom(roomId);
			}
		},

		addRoom() {
			this.resetForms();
			// this.addNewRoom = true;
			this.dialog = true;
		},

		async createRoom() {
			this.disableForm = true;

			await this.$store
				.dispatch("createRoom", this.addRoomUsername)
				.then(() => {
					const data = {
						snackText: "Tạo phòng thành công",
						snackBool: true,
					};
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => {
					const data = {
						snackText: "Tạo phòng thất bại",
						snackBool: true,
					};
					this.store.dispatch("addNotification", data);
					console.error(err);
				});

			this.addNewRoom = false;
			this.dialog = false;
			this.addRoomUsername = "";
			this.fetchMoreRooms();
		},

		inviteUser(roomId) {
			this.resetForms();
			this.inviteRoomId = roomId;
		},

		async addRoomUser() {
			this.disableForm = true;
			const memberName = this.invitedUsername;
			const data = {
				snackText: `Mời thành công ${memberName}`,
				snackBool: true,
			};
			const roomId = this.inviteRoomId;
			await this.$store
				.dispatch("addUser", { roomId, memberName })
				.then(() => {
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => console.log(err));

			this.inviteRoomId = null;
			this.invitedUsername = "";
			this.fetchMoreRooms();
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
			const data = {
				snackText: `Đã đuổi ${userName} ra khỏi phòng`,
				snackBool: true,
			};
			await this.$store
				.dispatch("removeUser", { roomId, userName })
				.then(() => {
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => console.log(err));

			this.removeRoomId = null;
			this.removeUserName = "";
			this.fetchMoreRooms();
		},

		getoutRoom(roomId) {
			this.getoutRoomId = roomId;
			this.dialogRemove = true;
		},

		async getOut() {
			const data = {
				snackText: "Thoát phòng thành công",
				snackBool: true,
			};
			var room_id = this.getoutRoomId;
			var username = this.user.username;
			await this.$store
				.dispatch("removeUser", { room_id, username })
				.then((res) => {
					if (!res.data) {
						const data = {
							snackText: "Thoát phòng thất bại",
							snackBool: true,
						};
						this.$store.dispatch("addNotification", data);
						return;
					}
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => {
					const data = {
						snackText: "Bạn là chủ, không thể thoát phòng",
						snackBool: true,
					};
					this.$store.dispatch("addNotification", data);
					console.log(err);
				});
			this.dialogRemove = false;
		},

		updateRoom(roomId) {
			this.updateRoomId = roomId;
			this.dialogRoom = true;
			this.roomName = this.roomInfo.roomName;
			this.roomAvatar = this.roomInfo.avatar;
		},

		async updateRoomInfo() {
			const data = {
				snackText: "Cập nhập thành công",
				snackBool: true,
			};

			const info = {
				room_id: this.updateRoomId,
				room_name: this.roomName,
				avatar: this.roomAvatar,
			};

			await this.$store
				.dispatch("updateRoom", info)
				.then(() => {
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => {
					const data = {
						snackText: "Cập nhập thất bại",
						snackBool: true,
					};
					this.$store.dispatch("addNotification", data);
					console.log(err);
				});
		},

		async deleteRoom(roomId) {
			const data = {
				snackText: `Đã xóa phòng`,
				snackBool: true,
			};
			await this.$store
				.dispatch("removeRoom", roomId)
				.then(() => {
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => console.log(err));

			this.fetchMoreRooms();
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

		sendNotification: function(data) {
			if (data == undefined || !data) {
				return;
			}
			if (data.userId == this.currentUserId) {
				console.log("Cung 1 nguoi na");
				if (data.userId != this.currentUserId) {
					console.log("Khac user na");
				}
				return;
			}
			var title = data.title === undefined ? "Notification" : data.title;
			var clickCallback = data.clickCallback;
			var message = data.message === undefined ? "null" : data.message;
			var icon =
				data.icon === undefined
					? "https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png"
					: data.icon;
			var sendNotification = function() {
				var notification = new Notification(title, {
					icon: icon,
					body: message,
				});
				if (clickCallback !== undefined) {
					notification.onclick = function() {
						clickCallback();
						notification.close();
					};
				}
			};

			if (!window.Notification) {
				return false;
			} else {
				if (Notification.permission === "default") {
					Notification.requestPermission(function(p) {
						if (p !== "denied") {
							sendNotification();
						}
					});
				} else {
					sendNotification();
				}
			}
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
