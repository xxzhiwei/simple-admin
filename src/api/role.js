import request from '@/utils/request';

// 获取角色分页
export function getPagination() {
    return request({
        url: '/role/pagination',
        method: 'get'
    });
}

// 获取角色列表
export function getList() {
    return request({
        url: '/role/list',
        method: 'get'
    });
}

// 获取用户角色列表
export function getListByUserId(userId) {
    return request({
        url: `/role/user/${userId}/list`,
        method: 'get'
    });
}

// 新增角色
export function save(data) {
    return request({
        url: '/role/save',
        method: 'post',
        data
    });
}

// 更新角色
export function update(data) {
    return request({
        url: '/role/update',
        method: 'post',
        data
    });
}

// 删除角色
export function del(data) {
    return request({
        url: `/role/del`,
        method: 'post',
        data
    });
}