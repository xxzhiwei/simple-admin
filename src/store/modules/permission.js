import { constantRoutes } from '@/router';

const state = {
    routes: [],
    userRoutes: []
};

const mutations = {
    setRoutes(state, payload) {
        const { routes } = payload;
        state.routes = constantRoutes.concat(routes);
        state.userRoutes = routes;
    }
};

const actions = {};

export default {
    namespaced: true,
    state,
    mutations,
    actions
}

