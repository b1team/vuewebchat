const state = { 
    notifications: null
};

const getters = {
    notifications: (state) => state.notifications,
};

const actions = {
    addNoitionalData({commit}, data) {
        commit("pushNoitionalData", data);
    }
};

const mutations = {
    pushNoitionalData(state, data) {
        state.notifications = data;
    }
};

export default {
	state,
	getters,
	actions,
	mutations,
};
