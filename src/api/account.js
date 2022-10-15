import request from '@/utils/request'

export function login(data) {
    return request({
        url: '/user/login',
        method: 'post',
        data
    });
}

export async function refresh(data) {
    return await request({
        url: '/user/refresh',
        method: 'post',
        data
    });
}

export function logout() {
    return request({
        url: '/user/logout',
        method: 'post'
    });
}
