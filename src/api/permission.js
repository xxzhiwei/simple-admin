import request from '@/utils/request'

// 获取（已登录）用户的菜单权限【「permission」就当作一个模块名吧】
export function getMenuList() {
    return request({
        url: `/permission/user/menuList`,
        method: 'get'
    });
}

// 获取角色权限
export function getListByRoleId(roleId) {
    return request({
        url: `/permission/role/${roleId}/list`,
        method: 'get'
    });
}


// 获取权限树（包含菜单、功能权限）
export function getList() {
    return request({
        url: '/permission/list',
        method: 'get'
    });
}

// 添加权限
export function save(data) {
    return request({
        url: '/permission/save',
        method: 'post',
        data
    });
}

// 更新权限
export function update(data) {
    return request({
        url: '/permission/update',
        method: 'post',
        data
    });
}

// 更新权限
export function del(data) {
    return request({
        url: `/permission/del`,
        method: 'post',
        data
    });
}
