<template>
    <div class="app-container">
        <div style="margin-bottom: 10px;">
            <el-button type="primary" size="small" @click="showDialogForAdding()">添加用户</el-button>
        </div>
        <el-table :data="list" style="width: 100%;margin-top:30px;" border>
            <el-table-column align="center" label="id" width="220" prop="id"></el-table-column>
            <el-table-column align="center" label="用户名" width="220" prop="username"></el-table-column>
            <el-table-column align="center" label="邮箱" prop="email"></el-table-column>
            <el-table-column align="center" label="操作">
                <template slot-scope="{ row }">
                    <el-button type="primary" size="small" @click="showDialogForEditing(row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="del(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div style="text-align: right; margin-top: 10px;">
            <el-pagination
                :page-size="query.size"
                layout="prev, pager, next"
                :total="total">
            </el-pagination>
        </div>

        <el-dialog :visible.sync="dialogVisible" :title="isEditing ? '编辑用户' : '新增用户'">
            <el-form :model="formData" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="formData.username" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="昵称">
                    <el-input v-model="formData.nickname" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="邮箱">
                    <el-input v-model="formData.email" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="初始密码" v-if="!isEditing">
                    <el-input v-model="formData.password" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="角色">
                    <el-checkbox-group v-model="roleIds">
                        <el-checkbox v-for="role of roleList" :label="role.id" :key="role.id">{{ role.name }}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <!-- <el-form-item label="头像">
                    <el-input v-model="formData.avatar" placeholder="请输入" />
                </el-form-item> -->
            </el-form>
            <div style="text-align:right;">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" v-if="isEditing" @click="update">确 定</el-button>
                <el-button type="primary" v-else @click="save">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getPagination, save, del, update } from "@/api/user";
import { getList, getListByUserId } from "@/api/role";
import { getDifference, copyProperties } from '@/utils/common.js';

const defaultFormData = {
    id: "",
    username: "",
    email: "",
    password: "",
    avatar: "",
    nickname: ""
};

export default {
    data() {
        return {
            dialogVisible: false,
            list: [], // table列表
            formData: { ...defaultFormData },
            isEditing: false,
            userRoleList: [], // 用户角色列表
            roleList: [], // 角色列表
            roleIds: [],
            total: 0,
            query: {
                size: 10,
                current: 1
            },
        };
    },
    created() {
        this.getPagination();
        this.getList();  
    },
    methods: {
        async getPagination() {
            const resp = await getPagination();
            if (resp.code !== 0) {
                return this.$message.error("获取分页失败");
            }
            this.list = resp.data.records;
            this.total = resp.data.total;
        },
        async getList() {
            const resp = await getList();
            if (resp.code !== 0) {
                return this.$message.error("获取列表失败");
            }
            this.roleList = resp.data;
        },
        async getListByUserId(id) {
            const resp = await getListByUserId(id);
            if (resp.code !== 0) {
                return this.$message.error("获取用户角色列表失败");
            }
            this.userRoleList = resp.data;
            this.roleIds = this.userRoleList.map(item => item.id);
        },
        showDialogForAdding() {
            this.isEditing = false;
            this.dialogVisible = true;
            this.formData = { ...defaultFormData };
            this.roleIds = [];
        },
        async save() {
            this.dialogVisible = false;
            this.formData.assigning = this.roleIds;
            const resp = await save(this.formData).catch((error) => {
                console.log(error);
            });
            if (resp.code !== 0) {
                this.$message.error("操作失败");
                return;
            }
            this.$message.success("操作成功");
            this.getPagination();
        },
        showDialogForEditing(data) {
            this.isEditing = true;
            this.dialogVisible = true;
            this.formData = copyProperties(data, { ...defaultFormData });
            this.getListByUserId(data.id);
        },
        async update() {
            this.dialogVisible = false;
            const roleIdsAssigned = this.userRoleList.map(item => item.id);
            this.formData.assigning = getDifference(this.roleIds, roleIdsAssigned);
            this.formData.removing = getDifference(roleIdsAssigned, this.roleIds);
            const resp = await update(this.formData).catch(
                (error) => {
                    console.log(error);
                }
            );
            if (resp.code !== 0) {
                this.$message.error("操作失败");
                return;
            }
            this.$message.success("操作成功");
            this.getPagination();
        },
        del(data) {
            this.$confirm("确认删除吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
            }).then(async () => {
                const resp = await del({ id: data.id }).catch((error) => {
                    console.log(error);
                });
                if (resp.code !== 0) {
                    this.$message.error("操作失败");
                    return;
                }
                this.$message.success("操作成功");
                this.getPagination();
            });
        }
    },
};
</script>

<style lang="scss" scoped>
.app-container {
    .roles-table {
        margin-top: 30px;
    }
}
</style>
