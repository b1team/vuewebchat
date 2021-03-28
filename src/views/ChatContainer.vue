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
			<button type="submit" :disabled="disableForm || !removeUserName" >
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
			@open-user-tag="openUserTag"
			@add-room="addRoom"
			@room-action-handler="menuActionHandler"
			@menu-action-handler="menuActionHandler"
			@send-message-reaction="sendMessageReaction"
			@typing-message="typingMessage"
			@toggle-rooms-list="$emit('show-demo-options', $event.opened)"
		>
		</chat-window>
	</div>
</template>

<script>
import { parseTimestamp, isSameDay } from "../utils/dates";
import ChatWindow from "../ChatWindow";
import axios from "axios";
import { mapGetters } from "vuex";

export default {
	name: "ChatContainer",
	components: {
		ChatWindow,
	},

	props: ["currentUserId", "theme", "isDevice"],

	data() {
		return {
			roomsPerPage: 15,
			rooms: [],
			list_rooms: [],
			roomId: "",
			startRooms: null,
			endRooms: null,
			roomsLoaded: false,
			loadingRooms: true,
			allUsers: [],
			loadingLastMessageByRoom: 0,
			roomsLoadedCount: true,
			selectedRoom: null,
			messagesPerPage: 10,
			messages: [],
			messagesLoaded: false,
			roomMessage: "",
			startMessages: null,
			endMessages: null,
			roomsListeners: [1],
			listeners: [],
			typingMessageCache: "",
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
			info: {},
			count: 0,
		};
	},

	mounted() {
		this.fetchRooms();
		this.updateUserOnlineStatus();
	},

	destroyed() {
		this.resetRooms();
	},

	computed: {
		loadedRooms() {
			return this.rooms.slice(0, this.roomsLoadedCount);
		},
		screenHeight() {
			return this.isDevice
				? window.innerHeight + "px"
				: "calc(100vh - 80px)";
		},
		...mapGetters(["user", "token"]),
	},
	async created() {
		this.fetchMoreRooms();
	},

	methods: {
		resetRooms() {
			this.loadingRooms = true;
			this.loadingLastMessageByRoom = 0;
			this.roomsLoadedCount = 0;
			this.rooms = [];
			this.roomsLoaded = true;
			this.startRooms = null;
			this.endRooms = null;
			this.roomsListeners.forEach((listener) => listener());
			this.roomsListeners = [];
			this.resetMessages();
			this.count = 0;
		},

		resetMessages() {
			this.messages = [];
			this.messagesLoaded = false;
			this.startMessages = null;
			this.endMessages = null;
			this.listeners.forEach((listener) => listener());
			this.listeners = [];
			this.count = 0;
		},

		fetchRooms() {
			this.resetRooms();
			this.fetchMoreRooms();
		},

		async fetchMoreRooms() {
			await axios
				.get("rooms", {
					Authorization: localStorage.getItem("token"),
				})
				.then((response) => {
					const rooms = response.data.rooms;
					console.log(rooms);
					for (var room of rooms) {
						const room_format = {
							roomId: room.id,
							roomName: room.room_name,
							avatar: room.avatar,
							unreadCount: room.unreadCount,
							lastMessage: {
								content: room.last_message.content,
								senderId: room.last_message.sender_id,
								timestamp: this.formatTimestamp(
									new Date(),
									new Date(room.last_message.timestamp)
								),
								saved: true,
								seen: room.last_message.seen,
								new: true,
							},
							users: [],
						};
						this.list_rooms = this.list_rooms.concat(room_format);
					}
				})
				.catch((error) => {
					console.error(error);
				});
		},

		formatTimestamp(date, timestamp) {
			const timestampFormat = isSameDay(date, new Date())
				? "HH:mm"
				: "DD/MM/YY";
			const result = parseTimestamp(timestamp, timestampFormat);
			return timestampFormat === "HH:mm" ? `Today, ${result}` : result;
		},

		fetchMessages({ room, options = {} }) {
			this.$emit("show-demo-options", false);
			if (options.reset) this.resetMessages();

			this.selectedRoom = room.roomId;

			axios
				.get("messages/room?room_id=" + room.roomId, {
					Authorization: localStorage.getItem("token"),
				})
				.then((response) => {
					console.log(response);
					const list_messages = response.data.messages;
					if (list_messages.length == 0) this.messagesLoaded = true;
					for (const mess of list_messages) {
						const message = {
							_id: mess.message_id,
							content: mess.content,
							date:
								new Date(mess.updated_at).getDate() +
								"/" +
								new Date(mess.updated_at).getMonth(),
							senderId: mess.sender.user_id,
							timestamp:
								new Date(mess.updated_at).getHours() +
								":" +
								new Date(mess.updated_at).getMinutes(),
							seen: mess.seen,
						};
						this.startMessages = mess.message_id;
						this.count = this.count + 1;
						this.messages = this.messages.concat(message);
						if (this.messages.length == response.data.count)
							return (this.messagesLoaded = true);
					}
				})
				.catch((error) => {
					console.log(error);
				});
		},

		async sendMessage({ content, roomId }) {
			await axios
				.post("message_management/send_message", {
					Authorization: this.token,
					content: content,
					room_id: roomId,
				})
				.then((response) => {
					console.log(response);
					const message = {
						_id: response.data.message_id,
						content: response.data.content,
						senderId: response.data.sender_id,
						timestamp:
							new Date(response.data.updated_at).getHours() +
							":" +
							new Date(response.data.updated_at).getMinutes(),
						seen: response.data.seen,
					};
					this.messages = this.messages.concat(message);
				})
				.catch((error) => {
					console.log(error);
				});
		},

		openFile({ message }) {
			window.open(message.file.url, "_blank");
		},

		// async openUserTag({ user }) {
		// 	let roomId

		// 	this.rooms.forEach(room => {
		// 		if (room.users.length === 2) {
		// 			const userId1 = room.users[0]._id
		// 			const userId2 = room.users[1]._id
		// 			if (
		// 				(userId1 === user._id || userId1 === this.currentUserId) &&
		// 				(userId2 === user._id || userId2 === this.currentUserId)
		// 			) {
		// 				roomId = room.roomId
		// 			}
		// 		}
		// 	})

		// 	if (roomId) return (this.roomId = roomId)

		// 	const query1 = await roomsRef
		// 		.where('users', '==', [this.currentUserId, user._id])
		// 		.get()

		// 	if (!query1.empty) {
		// 		return this.loadRoom(query1)
		// 	}

		// 	let query2 = await roomsRef
		// 		.where('users', '==', [user._id, this.currentUserId])
		// 		.get()

		// 	if (!query2.empty) {
		// 		return this.loadRoom(query2)
		// 	}

		// 	const room = await roomsRef.add({
		// 		users: [user._id, this.currentUserId],
		// 		lastUpdated: new Date()
		// 	})

		// 	this.roomId = room.id
		// 	this.fetchRooms()
		// },

		// async loadRoom(query) {
		// 	query.forEach(async room => {
		// 		if (this.loadingRooms) return
		// 		await roomsRef.doc(room.id).update({ lastUpdated: new Date() })
		// 		this.roomId = room.id
		// 		this.fetchRooms()
		// 	})
		// },

		async editMessage({ messageId, newContent}) {
			await axios.put("messages",{
				message_id: messageId,
				content: newContent,
				Authorization: this.token
			})
			.then((response) => {
				console.log(response.data);
			})
			.catch((error) => {
				console.log(error);
			})

		},

		async deleteMessage({ message }) {
			await axios.delete("messages"+ message._id, {
					Authorization: this.token
			})
			.then((response) => {
				console.log(response.data);
			})
			.catch((error) => {
				console.log(error);
			})
		},

		// async uploadFile({ file, messageId, roomId }) {
		// 	let type = file.extension || file.type
		// 	if (type === 'svg' || type === 'pdf') {
		// 		type = file.type
		// 	}

		// 	const uploadFileRef = filesRef
		// 		.child(this.currentUserId)
		// 		.child(messageId)
		// 		.child(`${file.name}.${type}`)

		// 	await uploadFileRef.put(file.blob, { contentType: type })
		// 	const url = await uploadFileRef.getDownloadURL()

		// 	await messagesRef(roomId)
		// 		.doc(messageId)
		// 		.update({
		// 			['file.url']: url
		// 		})
		// },

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

		// async sendMessageReaction({ reaction, remove, messageId, roomId }) {
		// 	const dbAction = remove
		// 		? firebase.firestore.FieldValue.arrayRemove(this.currentUserId)
		// 		: firebase.firestore.FieldValue.arrayUnion(this.currentUserId)

		// 	await messagesRef(roomId)
		// 		.doc(messageId)
		// 		.update({
		// 			[`reactions.${reaction.name}`]: dbAction
		// 		})
		// },

		// typingMessage({ message, roomId }) {
		// 	if (message?.length > 1) {
		// 		return (this.typingMessageCache = message)
		// 	}

		// 	if (message?.length === 1 && this.typingMessageCache) {
		// 		return (this.typingMessageCache = message)
		// 	}

		// 	this.typingMessageCache = message

		// 	const dbAction = message
		// 		? firebase.firestore.FieldValue.arrayUnion(this.currentUserId)
		// 		: firebase.firestore.FieldValue.arrayRemove(this.currentUserId)

		// 	roomsRef.doc(roomId).update({
		// 		typingUsers: dbAction
		// 	})
		// },

		async listenRooms(query) {
			const listener = query.onSnapshot((rooms) => {
				// this.incrementDbCounter('Listen Rooms Typing Users', rooms.size)
				rooms.forEach((room) => {
					const foundRoom = this.rooms.find(
						(r) => r.roomId === room.id
					);
					if (foundRoom) {
						foundRoom.typingUsers = room.data().typingUsers;
						foundRoom.index = room.data().lastUpdated.seconds;
					}
				});
			});
			this.roomsListeners.push(listener);
		},

		// updateUserOnlineStatus() {
		// 	const userStatusRef = firebase
		// 		.database()
		// 		.ref('/status/' + this.currentUserId)

		// 	const isOfflineData = {
		// 		state: 'offline',
		// 		lastChanged: firebase.database.ServerValue.TIMESTAMP
		// 	}

		// 	const isOnlineData = {
		// 		state: 'online',
		// 		lastChanged: firebase.database.ServerValue.TIMESTAMP
		// 	}

		// 	firebase
		// 		.database()
		// 		.ref('.info/connected')
		// 		.on('value', snapshot => {
		// 			if (snapshot.val() == false) return

		// 			userStatusRef
		// 				.onDisconnect()
		// 				.set(isOfflineData)
		// 				.then(() => {
		// 					userStatusRef.set(isOnlineData)
		// 				})
		// 		})
		// },

		// listenUsersOnlineStatus(rooms) {
		// 	rooms.map(room => {
		// 		room.users.map(user => {
		// 			const listener = firebase
		// 				.database()
		// 				.ref('/status/' + user._id)
		// 				.on('value', snapshot => {
		// 					if (!snapshot || !snapshot.val()) return

		// 					const lastChanged = this.formatTimestamp(
		// 						new Date(snapshot.val().lastChanged),
		// 						new Date(snapshot.val().lastChanged)
		// 					)

		// 					user.status = { ...snapshot.val(), lastChanged }

		// 					const roomIndex = this.rooms.findIndex(
		// 						r => room.roomId === r.roomId
		// 					)

		// 					this.$set(this.rooms, roomIndex, room)
		// 				})
		// 			this.roomsListeners.push(listener)
		// 		})
		// 	})
		// },

		addRoom() {
			this.resetForms();
			this.addNewRoom = true;
		},

		async createRoom() {
			this.disableForm = true;

			await axios
				.post("rooms?room_name=" + this.addRoomUsername, {
					Authorization: this.token,
				})
				.then((response) => {
					console.log(response);
				})
				.catch((error) => {
					console.log(error);
				});

			this.addNewRoom = false;
			this.addRoomUsername = "";
			this.fetchRooms();
		},

		inviteUser(roomId) {
			this.resetForms();
			this.inviteRoomId = roomId;
		},

		async addRoomUser() {
			this.disableForm = true;
			await axios
				.post("rooms/invite", {
					room_id: this.inviteRoomId,
					member_name: this.invitedUsername,
				})
				.then((response) => {
					alert("invite success");
					console.log(response);
				})
				.catch((error) => {
					console.log(error);
					alert("invite fail");
				});

			this.inviteRoomId = null;
			this.invitedUsername = "";
			this.fetchRooms();
		},

		removeUser(roomId) {
			this.resetForms();
			this.removeRoomId = roomId;
			this.removeUsers = this.rooms.find(
				(room) => room.roomId === roomId
			).users;
		},

		async deleteRoomUser() {
			this.disableForm = true

			await axios.delete("rooms/remove",{
				room_id: this.removeRoomId,
				member_name: this.removeUserName,
				Authorization: this.token
			})
			.then((response) => {
				console.log(response);
				alert("delete success");
			})
			.catch((error) => {
				alert("fail, you are not admin");
				console.log(error);
			})

			this.removeRoomId = null
			this.removeUserName = ''
			this.fetchRooms()
		},

		async deleteRoom(roomId) {
			await axios.delete('rooms?room_id='+ roomId, {
				Authorization: this.token
			})
			.then((response) => {
				alert("delete success")
				console.log(response);
			})
			.catch((error) => {
				alert("you are not admin");
				console.log(error);
			})

			this.fetchRooms()
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
