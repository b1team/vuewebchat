import Vue from "vue";
import Vuex from "vuex";
import User from "./modules/User";
import Room from "./modules/Rooms";
import Message from "./modules/Messages";
import Notifications from "./modules/Notifications";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: { User, Room, Message, Notifications },
});
