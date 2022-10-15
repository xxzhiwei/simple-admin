import request from '@/utils/request';

// 获取用户列表
export function getPagination() {
    return request({
        url: '/user/pagination',
        method: 'get'
    });
}

export function getList() {
    return request({
        url: '/user/list',
        method: 'get'
    });
}

// 新增用户
export function save(data) {
    return request({
        url: '/user/save',
        method: 'post',
        data
    });
}

// 更新用户
export function update(data) {
    return request({
        url: '/user/update',
        method: 'post',
        data
    });
}

// 删除用户
export function del(data) {
    return request({
        url: `/user/del`,
        method: 'post',
        data
    });
}