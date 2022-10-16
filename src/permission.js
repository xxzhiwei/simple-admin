import router, { asyncRoutes, NOT_FOUND } from './router';
import store from './store';
import NProgress from 'nprogress'; // progress bar
import getPageTitle from '@/utils/get-page-title';
import { getMenuList } from "@/api/permission";

import 'nprogress/nprogress.css'; // progress bar style

const whiteList = ['/login']; // no redirect whitelist

// 创建用户菜单【404页面需要在最后添加】
function makeUserRoutes(routes, menuList) {
    const _routes = [];
    for (const route of routes) {
        if (!route.value) {
            _routes.push(route);
            continue;
        }
        const menu = menuList.find((item) => item.value === route.value);
        if (!menu) {
            continue;
        }
        route.meta.title = menu.name; // 目前只用到了【name这个属性】

        // 若存在子路由，则继续匹配；
        if (route.children && route.children.length > 0) {
            route.children = makeUserRoutes(
                route.children,
                menuList
            );
        }
        _routes.push(route);
    }
    return _routes;
}

NProgress.configure({ showSpinner: false }); // NProgress Configuration

router.beforeEach(async (to, from, next) => {

    // start progress bar
    NProgress.start();

    // set page title
    document.title = getPageTitle(to.meta.title);

    // 白名单跳过校验
    if (whiteList.includes(to.path)) {
        if (to.path === '/login' && store.getters.token) {
            next({ path: '/' });
        }
        else {
            next();
        }
        return;
    }
    
    const _userRoutes = store.state.permission.userRoutes;
    if (_userRoutes && _userRoutes.length) {
        next();
        return;
    }

    // 没有菜单时，请求菜单权限
    const resp = await getMenuList();
    if (!resp || resp.code !== 0) {
        throw new Error("获取菜单失败");
    }

    const userRoutes = makeUserRoutes(asyncRoutes, resp.data);

    userRoutes.push(NOT_FOUND);
    router.addRoutes(userRoutes);
    store.commit("permission/setRoutes", { routes: userRoutes });

    // 动态添加路由后，将重新进入该页面【这样通过addRoutes添加的路由才会生效，也就是说'当前往router动态添加的路由'会在'下一次router读取数据'的时候生效】
    next({ ...to, replace: true });
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done();
})
