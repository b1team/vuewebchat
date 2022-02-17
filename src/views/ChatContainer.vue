<template>
	<div class="window-container" :class="{ 'window-mobile': isDevice }">
		<v-dialog v-model="dialogRemove" max-width="290">
			<v-card>
				<v-card-title class="headline"> Bạn muốn thoát ? </v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>

					<v-btn
						color="black darken-1"
						text
						@click="dialogRemove = false"
					>
						Không
					</v-btn>

					<v-btn color="white darken-1" text @click="getOut">
						Đồng ý
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialogaddUser" persistent max-width="290">
			<v-card>
				<v-card-title class="headline"> Mời vào phòng </v-card-title>
				<v-card-text>
					<v-text-field
						v-model="invitedUsername"
						label="Tên người dùng"
						required
					></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="black lighten-1"
						text
						@click="dialogaddUser = false"
					>
						Thoát
					</v-btn>
					<v-btn color="white darken-1" text @click="addRoomUser">
						Mời
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialogDeleteUser" persistent max-width="300">
			<v-card>
				<v-card-title class="headline">
					Bạn thực sự muốn đuổi thành viên này?
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="black darken-1"
						text
						@click="dialogDeleteUser = false"
					>
						Thoát
					</v-btn>
					<v-btn color="white darken-1" text @click="deleteRoomUser">
						Xóa
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialog" persistent max-width="290">
			<v-card>
				<v-card-title class="headline"> Tạo phòng </v-card-title>
				<v-card-text>
					<v-text-field
						v-model="addNewRoomName"
						label="Tên phòng"
						required
					></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="black darken-1" text @click="dialog = false">
						Thoát
					</v-btn>
					<v-btn color="white darken-1" text @click="createRoom">
						Tạo phòng
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialogRoom" persistent max-width="290">
			<v-card>
				<v-card-title class="headline"> Thông tin phòng </v-card-title>
				<v-card-text>
					<v-text-field
						label="Tên phòng"
						v-model="roomName"
						required
					></v-text-field>
					<v-text-field
						label="Hình đại diện"
						v-model="roomAvatar"
						required
					></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="black darken-1"
						text
						@click="dialogRoom = false"
					>
						Thoát
					</v-btn>
					<v-btn color="white darken-1" text @click="updateRoomInfo">
						Cập nhập
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialogMember" scrollable max-width="300px">
			<v-card>
				<v-card-title>Thành viên</v-card-title>
				<v-divider></v-divider>
				<v-card-text>
					<v-list-item
						v-for="member in members"
						:key="member.user_id"
					>
						<v-list-item-avatar>
							<v-img :src="member.avatar"></v-img>
						</v-list-item-avatar>
						<v-list-item-title>{{
							member.username
						}}</v-list-item-title>
						<v-list-item-action>
							<v-btn
								v-if="checkOwner(member.user_id)"
								class="ma-1"
								color="error"
								plain
								style="background-color: white"
								@click="deleteUser(member.username)"
							>
								Xóa
							</v-btn>
						</v-list-item-action>
					</v-list-item>
				</v-card-text>
				<v-divider></v-divider>
				<v-card-actions>
					<v-btn color="white" text @click="dialogMember = false">
						OK
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="dialogDeleteRoom" persistent max-width="300">
			<v-card>
				<v-card-title class="headline">
					Bạn thực sự muốn xóa phòng?
				</v-card-title>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="black darken-1"
						text
						@click="dialogDeleteRoom = false"
					>
						Không
					</v-btn>
					<v-btn color="white darken-1" text @click="removeRoom">
						Xóa
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
			:menu-actions="menuActions"
			:room-message="roomMessage"
			:filterdLinks="filterdLinks"
			@fetch-more-rooms="fetchMoreRooms"
			@fetch-messages="fetchMessages"
			@send-message="sendMessage"
			@edit-message="editMessage"
			@delete-message="deleteMessage"
			@add-room="addRoom"
			@room-action-handler="menuActionHandler"
			@menu-action-handler="menuActionHandler"
			@toggle-rooms-list="$emit('show-demo-options', $event.opened)"
			@fetch-data-room="fetchDataRoom"
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
			addNewRoomName: "",
			inviteRoomId: null,
			invitedUsername: "",
			removeRoomId: null,
			removeUserName: "",
			menuActions: [],
			styles: { container: { borderRadius: "4px" } },
			connection: null,
			socketNotification: null,
			snackBool: false,
			snackText: "",
			dialog: false,
			dialogRemove: false,
			getoutRoomId: null,
			dialogRoom: false,
			roomName: "",
			roomAvatar: "",
			updateRoomId: null,
			dialogaddUser: false,
			dialogDeleteUser: false,
			dialogMember: false,
			dialogDeleteRoom: false,
			is_owner: { owner: false, id: null },
			senderRoomName: null,
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
			"members",
		]),
	},

	created() {
		this.fetchMoreRooms();
		this.socketSend();
		this.socketNotify();
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

		checkOwner(id) {
			if (this.is_owner.owner && id === this.currentUserId) {
				return false;
			}
			if (!this.is_owner.owner) {
				return false;
			}
			return true;
		},

		message_is_exist: function(message) {
			const message_id = message.message_id;

			for (const message of this.messages)
				if (message_id === message._id) return true;
			return false;
		},

		async fetchMoreRooms () {
			await this.$store.dispatch("fetchAllRooms").then(() => {
				this.list_rooms = this.rooms.sort(
					(a, b) =>
						new Date(b.lastMessage.date) -
						new Date(a.lastMessage.date)
				);
			});
		},

		setOwner(id) {
			this.$store.dispatch("members", id).then((response) => {
				for (const member of response) {
					if (
						member.user_id == this.currentUserId &&
						member.is_owner
					) {
						this.is_owner.owner = true;
						this.is_owner.id = this.currentUserId;
						break;
					} else {
						this.is_owner.owner = false;
						this.is_owner.id = this.currentUserId;
					}
				}
			});
		},

		setRoomAction() {
			const actions = [
				{ name: "inviteUser", title: "Mời vào phòng" },
				{ name: "getoutRoom", title: "Rời phòng" },
				{ name: "updateRoom", title: "Cập nhập phòng" },
				{ name: "members", title: "Thành viên" },
				{ name: "deleteRoom", title: "Xóa phòng" },
			];

			if (this.is_owner.owner) {
				actions.splice(1, 1);
				this.menuActions = actions;
			} else {
				actions.splice(4, 1);
				this.menuActions = actions;
			}
		},

		setData({ room }) {
			this.roomId = room.roomId;
			this.roomName = room.roomName;
			this.roomAvatar = room.avatar;
		},

		fetchDataRoom({ room }) {
			this.setOwner(room.roomId);
			this.setData({ room });
			this.setRoomAction();
		},

		async fetchMessages({ room, options = {} }) {
			this.$emit("show-demo-options", false);
			if (options.reset) this.resetMessages();

			var roomId = room.roomId;
			const roomInfo = {
				roomName: room.roomName,
				avatar: room.avatar ? room.avatar : "",
			};
			try {
				await this.$store
				.dispatch("fetchRoomMessage", { roomId, roomInfo })
				.then(() => (this.messages = this.listMessages));
			} catch (error) {
				this.messages = [];
			}
			this.messagesLoaded = false;
			this.fetchDataRoom({ room });
		},

		async sendMessage({ content, roomId }) {
			const username = this.user.username;
			await this.$store
				.dispatch("sendMessages", { content, roomId, username })
				.then((response) => {
					if (response.name === "Error") {
						const data = {
							snackText: `Bạn không có trong phòng`,
							snackBool: true,
						};
						this.$store.dispatch("addNotification", data);
						return;
					}
					this.messages.push(this.newMessage);
					for (const room of this.list_rooms) {
						if (room.roomId === roomId) {
							room.lastMessage = this.$store.getters.lastMessage;
						}
					}
					this.fetchMoreRooms();
				})
				.catch((error) => {
					console.error("SEND MESSAGE ERROR: " + error);
					const data = {
						snackText: `Bạn không có trong phòng`,
						snackBool: true,
					};
					this.$store.dispatch("addNotification", data);
				});
		},

		setLastMessage(roomId, { message }) {
			this.list_rooms.filter(function(room) {
				if (room.roomId === roomId) {
					room.lastMessage = {
						content: message.content,
						senderId: message.sender_id,
						username: message.username,
						timestamp: new Date(
							message.created_at
						).toLocaleDateString("en-GB"),
						saved: true,
						seen: message.seen,
						new: true,
					};
				}
			});
		},

		getRoomNamebyID(roomId) {
			for (const room of this.list_rooms) {
				if (room.roomId === roomId) {
					this.senderRoomName = room.roomName;
					this.roomId = room.roomId;
					break;
				}
			}
		},

		socketSend: function() {
			this.connection = new WebSocket(
				`${process.env.VUE_APP_CHAT_WS}?token=` + this.token
			);

			// this.connection.vue = this;
			this.connection.onmessage = (event) => {
				//push message
				var data = JSON.parse(event.data);
				var message = data.payload;
				this.getRoomNamebyID(message["room_id"]);
				if (message["room_id"] != this.roomId) {
					this.setLastMessage(message["room_id"], { message });
					if (message["sender_id"] != this.currentUserId) {
						this.sendNotification({
							userId: message["sender_id"],
							title: `Tin nhắn mới từ ${this.senderRoomName}`,
							message:
								message["username"] + ": " + message["content"],
							icon:
								"https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png",
							clickCallback: function() {
								alert("Thông báo");
							},
						});
					}
					this.fetchMoreRooms();
					return;
				}
				if (this.message_is_exist(message)) {
					return;
				}
				message["_id"] = message["message_id"];
				message["senderId"] = message["sender_id"];
				message["timestamp"] =
					("0" + new Date(message.created_at).addHours(0).getHours()).slice(-2) +
					":" +
					("0" + new Date(message.created_at).getMinutes()).slice(-2);
				this.messages.push(message);
		
				// notification new message
				if (message["sender_id"] != this.currentUserId) {
					this.sendNotification({
						userId: message["senderId"],
						title: `Tin nhắn mới từ ${this.senderRoomName}`,
						message:
							message["username"] + ": " + message["content"],
						icon:
							"https://cdn2.iconfinder.com/data/icons/mixed-rounded-flat-icon/512/megaphone-64.png",
						clickCallback: function() {
							alert("Thông báo");
						},
					});
				}
				this.fetchMoreRooms();
				event.preventDefault();
			};

			// eslint-disable-next-line no-unused-vars
			this.connection.onerror = (event) =>{
				this.$store.dispatch("logout");
				this.$router.push("/login");
			};

			this.connection.onopen = (event) => {
				event.preventDefault();
				console.log("Connected socket send message");
			};
		},

		socketNotify: function() {
			this.socketNotification = new WebSocket(
				`${process.env.VUE_APP_NOTIFICATIONS_WS}?token=` + this.token
			);
			this.socketNotification.onmessage = (event) => {
				var data = JSON.parse(event.data);
				if (
					data.event_type === "invite" ||
					data.event_type === "delete"
				) {
					this.fetchMoreRooms();
				}

				var idRoom = this.roomId;
				if (data.event_type === "update") {
					this.messages.filter(function(mess) {
						if (
							mess._id === data.payload.message_id &&
							idRoom === data.payload.room_id
						) {
							mess.content = data.payload.content;
						}
					});
				}

				if (data.event_type === "delete_mess") {
					if (idRoom === data.payload.room_id) {
						const index = parseInt(data.payload.index);
						this.fectMessageAfterDelete(index);
					}
				}

				event.preventDefault();
			};

			this.socketNotification.onopen = (event) => {
				event.preventDefault();
				console.log("Connected event notification");
			};

			this.socketNotification.onerror = (event) => {
				event.preventDefault();
			};
		},

		formatTimestamp(date, timestamp) {
			const timestampFormat = isSameDay(date, new Date())
				? "HH:mm"
				: "DD/MM/YY";
			const result = parseTimestamp(timestamp, timestampFormat);
			return timestampFormat === "HH:mm" ? `Hôm nay, ${result}` : result;
		},

		async editMessage({ messageId, newContent }) {
			var room_id = this.roomId;
			await this.$store.dispatch("editMessage", {
				messageId,
				newContent,
				room_id,
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
				const roomId = this.roomId;
				this.list_rooms.filter(function(room) {
					if (room.roomId === roomId) {
						room.lastMessage = lastMessage;
					}
				});
			}
		},

		fectMessageAfterDelete(index) {
			this.messages.splice(index, 1);

			const roomId = this.roomId;
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

		async deleteMessage({ message }) {
			const idRoom = this.roomId;
			await this.$store.dispatch("deleteMessage", { message, idRoom });
			const index = this.$store.getters.deleteMessage.index;
			this.fectMessageAfterDelete(index);
		},

		menuActionHandler({ action, roomId }) {
			switch (action.name) {
				case "inviteUser":
					return this.inviteUser(roomId);
				case "deleteRoom":
					return this.deleteRoom();
				case "getoutRoom":
					return this.getoutRoom(roomId);
				case "updateRoom":
					return this.updateRoom(roomId);
				case "members":
					return this.getMembers();
			}
		},

		addRoom() {
			this.resetForms();
			this.dialog = true;
		},

		async createRoom() {
			this.disableForm = true;

			await this.$store
				.dispatch("createRoom", this.addNewRoomName)
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
					console.error("CREATE ROOM ERROR:",err);
				});

			this.addNewRoom = false;
			this.dialog = false;
			this.addNewRoomName = "";
			await this.fetchMoreRooms();
		},

		inviteUser(roomId) {
			this.resetForms();
			this.inviteRoomId = roomId;
			this.dialogaddUser = true;
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
				.then((res) => {
					if (res.name === "Error") {
						const data = {
							snackText: `Trong phòng đã có ${memberName}`,
							snackBool: true,
						};
						this.$store.dispatch("addNotification", data);
						return;
					}
					this.inviteRoomId = null;
					this.invitedUsername = "";
					this.dialogaddUser = false;
					// this.fetchMessages();
					this.setOwner(roomId);
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => console.log("INVITE MEMBER ERROR: ", err));

		},

		deleteUser(name) {
			this.removeRoomId = this.roomId;
			this.removeUserName = name;
			this.dialogDeleteUser = true;
		},

		async deleteRoomUser() {
			this.disableForm = true;
			var roomId = this.removeRoomId;
			var userName = this.removeUserName; // this.removeUserName

			await this.$store
				.dispatch("removeUser", { roomId, userName })
				.then((response) => {
					if (response.name === "Error") {
						var data = {
							snackText: `Có lỗi`,
							snackBool: true,
						};
						this.$store.dispatch("addNotification", data);
						return;
					}
					data = {
						snackText: `Đã đuổi ${userName} ra khỏi phòng`,
						snackBool: true,
					};
					this.setOwner(roomId);
					this.$store.dispatch("addNotification", data);
					this.removeRoomId = null;
					this.removeUserName = "";
					this.dialogDeleteUser = false;
					this.fetchMoreRooms();
				})
				.catch((err) => console.log("DELETE ROOM ERROR:",err));
		},

		getoutRoom(roomId) {
			this.getoutRoomId = roomId;
			this.dialogRemove = true;
		},

		async getOut() {
			const data = {
				snackText: "Thoát phòng thành công, mời chọn phòng khác",
				snackBool: true,
			};
			var room_id = this.getoutRoomId;
			var username = this.user.username;
			await this.$store
				.dispatch("getOutRoom", { room_id, username })
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
					console.log("GET OUT ROOM ERROR:",err);
				});
			this.dialogRemove = false;
			let i = this.list_rooms.map((item) => item.roomId).indexOf(room_id); // find index of your object
			this.list_rooms.splice(i, 1);
			this.messages = [];
			await this.fetchMoreRooms();
			await this.fetchMessages();
		},

		updateRoom(roomId) {
			this.updateRoomId = roomId;
			this.dialogRoom = true;
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

			const updateRoomId = this.updateRoomId;
			const newInfo = {
				roomName: this.roomName,
				avatar: this.roomAvatar,
			};

			await this.$store
				.dispatch("updateRoom", info)
				.then(() => {
					this.list_rooms.filter(function(room) {
						if (room.roomId === updateRoomId) {
							room.avatar = newInfo.roomAvatar;
							room.roomName = newInfo.roomName;
						}
					});
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => {
					const data = {
						snackText: "Cập nhập thất bại",
						snackBool: true,
					};
					this.$store.dispatch("addNotification", data);
					console.log("UPDATE ROOM ERROR",err);
				});
			this.dialogRoom = false;
			await this.fetchMoreRooms();
		},

		async removeRoom() {
			const data = {
				snackText: `Đã xóa phòng`,
				snackBool: true,
			};
			await this.$store
				.dispatch("removeRoom", this.roomId)
				.then(() => {
					this.$store.dispatch("addNotification", data);
				})
				.catch((err) => console.log("DELETE ROOM ERROR ", err));
			this.dialogDeleteRoom = false;
			var room_id = this.roomId;
			let i = this.list_rooms.map(item => item.roomId).indexOf(room_id);
			this.list_rooms.splice(i, 1);
			this.messages = [];
			await this.fetchMoreRooms();
		},

		deleteRoom() {
			this.dialogDeleteRoom = true;
		},

		getMembers() {
			this.dialogMember = true;
		},

		resetForms() {
			this.disableForm = false;
			this.addNewRoom = null;
			this.addNewRoomName = "";
			this.inviteRoomId = null;
			this.invitedUsername = "";
			this.removeRoomId = null;
			this.removeUserName = "";
		},

		sendNotification: function(data) {
			if (data == undefined || !data) {
				return;
			}
			if (data.userId === this.currentUserId) {
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
