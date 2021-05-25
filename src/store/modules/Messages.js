import axios from "axios";
import { formatTimestamp } from "../../utils/dates";

Date.prototype.addHours = function(h) {
	this.setHours(this.getHours() + h);
	return this;
};

Date.prototype.addMonth = function(h) {
	this.setMonth(this.getMonth() + h);
	return this;
};

const state = {
	listMessages: null,
	messageLoaded: false,
	lastMessage: null,
	newMessage: null,
	roomInfo: null,
	editMessageContent: null,
	editMessageId: null,
	deleteMessage: null,
	socketMessage: null,
};

const getters = {
	listMessages: (state) => state.listMessages,
	messageLoaded: (state) => state.messageLoaded,
	lastMessage: (state) => state.lastMessage,
	newMessage: (state) => state.newMessage,
	editMessageContent: (state) => state.editMessageContent,
	editMessageId: (state) => state.editMessageId,
	deleteMessage: (state) => state.deleteMessage,
	socketMessage: (state) => state.socketMessage,
	roomInfo: (state) => state.roomInfo
};

const actions = {
	fetchRoomMessage({ commit }, { roomId, roomInfo }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "get",
				url: "messages/room?room_id=" + roomId,
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					const messages = [];
					var index = 0;
					const list_messages = response.data.messages;
					if (list_messages.length == 0) state.messagesLoaded = true;
					for (const mess of list_messages) {
						const message = {
							_id: mess.message_id,
							index: index,
							content: mess.content,
							date: new Date(mess.updated_at).toLocaleDateString(
								"en-GB"
							),
							senderId: mess.sender.user_id,
							username: mess.sender.username,
							timestamp:
								new Date(mess.updated_at)
									.addHours(7)
									.getHours() +
								":" +
								(
									"0" + new Date(mess.updated_at).getMinutes()
								).slice(-2),
							seen: mess.seen,
						};
						index += 1;
						messages.push(message);
						if (messages.length == response.data.count) {
							return (state.messagesLoaded = true);
						}
						commit("listMessages", { messages, roomInfo });
						resolve(response);
					}
				})
				.catch((error) => {
					reject(error);
					console.log("LIST MESSAGE ERROR:", error);
				});
		});
	},

	sendMessages({ commit }, { content, roomId, username }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "message_management/send_message",
				data: {
					content: content,
					room_id: roomId,
				},
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					if (!response.data) {
						return;
					}
					const newMessage = {
						_id: response.data.message_id,
						content: response.data.content,
						username: username,
						senderId: response.data.sender_id,
						timestamp:
							new Date(response.data.created_at)
								.addHours(7)
								.getHours() +
							":" +
							new Date(response.data.created_at).getMinutes(),
						seen: response.data.seen,
						save: true,
						new: true,
					};

					const lastMessage = {
						content: content,
						senderId: response.data.sender_id,
						username: response.data.username,
						timestamp: formatTimestamp(
							new Date(),
							new Date(response.data.created_at)
						),
						saved: true,
						seen: response.data.seen,
						new: true,
					};

					commit("send", { newMessage, lastMessage });
					resolve(response);
				})
				.catch((error) => {
					reject(error);
					console.log("SEND MESSAGE ERROR: ", error);
				});
		});
	},

	editMessage({ commit }, { messageId, newContent, room_id }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "put",
				url: "messages",
				data: {
					message_id: messageId,
					content: newContent,
					room_id: room_id,
				},
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("edit", { messageId, newContent });
					resolve(response);
				})
				.catch((error) => {
					reject(error);
					console.log("EDIT MESSAGE ERROR: ", error);
				});
		});
	},

	deleteMessage({ commit }, { message, idRoom }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "delete",
				url: "messages",
				data: {
					message_id: message._id,
					room_id: idRoom,
					index: message.index
				},
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("delete", message);
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},
	socketMessage({ commit }, message) {
		commit("socketMessage", message);
	},
};

const mutations = {
	listMessages(state, { messages, roomInfo }) {
		state.listMessages = messages;
		state.roomInfo = roomInfo;
	},
	send(state, { newMessage, lastMessage }) {
		state.newMessage = newMessage;
		state.lastMessage = lastMessage;
	},
	edit(state, { messageId, newContent }) {
		state.editMessageContent = newContent;
		state.editMessageId = messageId;
	},
	delete(state, message) {
		state.deleteMessage = message;
	},
	socketMessage(state, message) {
		state.socketMessage = message;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
