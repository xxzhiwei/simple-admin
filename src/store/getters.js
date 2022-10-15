const getters = {
    sidebar: state => state.app.sidebar,
    device: state => state.app.device,
    token: state => state.user.accessToken,
    routes: state => state.permission.routes
    //   avatar: state => state.user.avatar,
    //   name: state => state.user.user.username
};
export default getters;
