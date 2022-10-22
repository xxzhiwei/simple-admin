import router, { asyncRoutes, NOT_FOUND } from './router';
import store from './store';
import NProgress from 'nprogress';
import getPageTitle from '@/utils/get-page-title';
import { getMenuList } from "@/api/permission";

import 'nprogress/nprogress.css';

// 不需要通过接口获取的路径
const whiteList = ['/login'];

// 创建用户菜单【404页面需要在最后添加】
// 关于【菜单】的一个注意点：项目采用【若某个用户拥有某个页面的权限，则说明其同时拥有获取该页面下所有数据的权限】，以此来减少分配角色权限时的繁杂度
function makeUserRoutes(routes, menuList) {
    const _routes = [];
    for (const route of routes) {
        // 用于前端开发新页面时，没有分配权限的情况
        if (route.temporary) {
            _routes.push(route);
            continue;
        }

        const menu = menuList.find((item) => item.value === route.value);
        if (!menu) {
            continue;
        }

        // 目前只用到了【name这个属性】，如有需要，可继续使用其他属性，或者拓展「extra属性」
        route.meta.title = menu.name;
        route.value = menu.value;

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

// NProgress Configuration
NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
    
    // start progress bar
    NProgress.start();

    document.title = getPageTitle(to.meta.title);

    if (whiteList.includes(to.path)) {
        if (to.path === '/login' && store.getters.token) {
            next({ path: '/' });
        }
        else {
            next();
        }
        return;
    }

    // 以当前项目的逻辑来说，由于只会加载当前用户拥有的菜单，所以不会存在【无权限访问某个页面】的情况（即存在404，而不存在403），
    // 因此此处不需要添加权限判断逻辑；
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

    // 动态添加路由后，将重新进入该页面，再通过next()放行【这样通过addRoutes添加的路由才会生效，也就是说'当前往router动态添加的路由'会在'下一次router读取数据'的时候生效】
    next({ ...to, replace: true });
})

router.afterEach(() => {
    // finish progress bar
    NProgress.done();
})
