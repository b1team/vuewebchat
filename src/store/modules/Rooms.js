import axios from "axios";

const state = {
	rooms: null,
	success: false,
};

const getters = {
	rooms: (state) => state.rooms,
};

const actions = {
	fetchAllRooms({ commit }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "get",
				url: "rooms",
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					const list_rooms = [];
					const rooms = response.data.rooms;
					for (var room of rooms) {
						const room_format = {
							roomId: room.id,
							roomName: room.room_name,
							avatar: room.avatar,
							// unreadCount: room.unreadCount,
							users: [],
						};

						if (Object.keys(room.last_message).length !== 0) {
							const lastMessage = {
								content: room.last_message.content,
								senderId: room.last_message.sender_id,
								username: room.last_message.username,
								timestamp: new Date(
									room.last_message.timestamp
								).toLocaleDateString("en-GB"),

								saved: true,
								seen: room.last_message.seen,
								new: true,
							};

							room_format["lastMessage"] = lastMessage;
						} else {
							room_format["lastMessage"] = { content: "" };
						}
						list_rooms.push(room_format);
					}
					commit("rooms", list_rooms);
					resolve(response);
				})
				.catch((error) => {
					reject(error);
					console.error(error);
				});
		});
	},

	createRoom({ commit }, roomName) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "rooms?room_name=" + roomName,
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("success");
					resolve(response);
				})
				.catch((error) => {
					reject(error);
					console.log("CREATE ROOM ERROR: ", error);
				});
		});
	},

	addUser({ commit }, { roomId, memberName }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: "rooms/invite",
				data: {
					room_id: roomId,
					member_name: memberName,
				},
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("success");
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	removeUser({ commit }, { roomId, userName }) {
		return new Promise((resolve, reject) => {
			axios({
				method: "delete",
				url: "rooms/remove",
				data: {
					room_id: roomId,
					member_name: userName,
				},
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("success");
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	removeRoom({ commit }, roomId) {
		return new Promise((resolve, reject) => {
			axios({
				method: "delete",
				url: "rooms?room_id=" + roomId,
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("success");
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	updateRoom({ commit }, data) {
		return new Promise((resolve, reject) => {
			axios({
				method: "put",
				url: "rooms/update",
				data: {
					room_id: data.room_id,
					room_name: data.room_name,
					avatar: data.avatar
				},
				headers: {
					Authorization: "Bearer " + localStorage.getItem("token"),
				},
			})
				.then((response) => {
					commit("success");
					resolve(response);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},
};

const mutations = {
	rooms(state, rooms) {
		state.rooms = rooms;
	},
	success(state) {
		state.success = true;
	},
};

export default {
	state,
	getters,
	actions,
	mutations,
};
