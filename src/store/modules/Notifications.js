const state = { 
    notifications: null
};

const getters = {
    notifications: (state) => state.notifications,
};

const actions = {
    addNotification({commit}, data) {
        commit("pushNotification", data)
    }
};

const mutations = {
    pushNotification(state, data) {
        state.notifications = data;
    }
};

export default {
	state,
	getters,
	actions,
	mutations,
};
