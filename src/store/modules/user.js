import { resetRouter } from "@/router";

const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");
const userJson = localStorage.getItem("user");

let user = {
    username: "",
    avatar: ""
};
if (userJson) {
    user = JSON.parse(userJson);
}

const getDefaultState = () => {
    return {
        refreshToken: refreshToken,
        accessToken: accessToken,
        name: user.username,
        avatar: user.avatar,
        user: user
    };
}

const state = getDefaultState();

const mutations = {
    SET_USER(state, info) {
        const { user } = info;
        state.user = user;
        state.name = user.username;
        state.avatar = user.avatar;
        localStorage.setItem("user", JSON.stringify(user));
    },
    SET_REFRESH_TOKEN(state, payload) {
        const { refreshToken } = payload;
        state.refreshToken = refreshToken;
        localStorage.setItem("refreshToken", refreshToken);
    },
    SET_ACCESS_TOKEN(state, payload) {
        const { accessToken } = payload;
        state.accessToken = accessToken;
        localStorage.setItem("accessToken", accessToken);
    }
};

const actions = {
    saveLoginInfo({ commit }, payload) {
        const { user, accessToken, refreshToken } = payload;
        commit("SET_USER", { user });
        commit("SET_ACCESS_TOKEN", { accessToken });
        commit("SET_REFRESH_TOKEN", { refreshToken });
    },
    logout({ commit }) {
        resetRouter();
        commit("SET_USER", { user: user });
        commit("SET_ACCESS_TOKEN", { accessToken: "" });
        commit("SET_REFRESH_TOKEN", { refreshToken: "" });
        commit("permission/setRoutes", { routes: [] }, { root: true });
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};
