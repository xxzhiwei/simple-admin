<template>
    <div class="app-container">
        <div style="margin-bottom: 10px;">
            <el-button type="primary" size="small" @click="showDialogForAdding">添加角色</el-button>
        </div>
        <el-table :data="list" style="width: 100%;margin-top:30px;" border>
            <el-table-column align="center" label="id" width="220" prop="id"></el-table-column>
            <el-table-column align="center" label="名称" width="220" prop="name"></el-table-column>
            <el-table-column align="header-center" label="描述" prop="description"></el-table-column>
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

        <el-dialog :visible.sync="dialogVisible" :title="isEditing ? '编辑角色' : '新增角色'">
            <el-form :model="formData" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="formData.name" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="formData.description" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" placeholder="请输入" />
                </el-form-item>
                <el-form-item label="权限">
                    <el-tree check-strictly :props="props" :default-expanded-keys="defaultExpandedKeys" ref="tree" :data="permissionList" show-checkbox node-key="id" :expand-on-click-node="false">
                        <span class="custom-tree-node" slot-scope="{ data }">
                            <span style="font-size: 14px;">
                                <i v-if="data.type === 1" class="el-icon-menu" />
                                <i v-else class="el-icon-position" />
                                {{ data.name }}
                            </span>
                        </span>
                    </el-tree>
                </el-form-item>
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
import { getPagination, save, update, del } from "@/api/role";
import { getList as getPermissionList, getListByRoleId as getRolePermissionList } from "@/api/permission";
import { getDifference, copyProperties } from '@/utils/common.js';

const defaultFormData = {
    id: "",
    name: "",
    description: "",
};

export default {
    data() {
        return {
            dialogVisible: false,
            list: [],
            formData: { ...defaultFormData },
            isEditing: false,
            permissionList: [],
            rolePermissionList: [],
            total: 0,
            query: {
                size: 10,
                current: 1
            },
            props: {
                label: "name",
                children: "children",
            },
            permissionIdsAssigned: null
        };
    },
    computed: {
        // 默认展开第一级节点
        defaultExpandedKeys() {
            return this.permissionList.map(item => item.id);
        }
    },
    created() {
        this.getPagination();
        this.getPermissionList();
    },
    methods: {
        async getPagination() {
            const resp = await getPagination();
            if (resp.code !== 0) {
                return this.$message.error("获取数据失败");
            }
            this.list = resp.data.records;
            this.total = resp.data.total;
        },
        async getPermissionList() {
            const resp = await getPermissionList();
            if (resp.code !== 0) {
                return this.$message.error("获取权限数据失败");
            }
            this.permissionList = resp.data;
        },
        showDialogForAdding() {
            this.isEditing = false;
            this.dialogVisible = true;
            this.formData = { ...defaultFormData };
            this.$nextTick(() => {
                this.$refs.tree.setCheckedKeys([]);
            });
        },
        async save() {
            this.dialogVisible = false;
            const checked = this.$refs.tree.getCheckedKeys();

            this.formData.assigning = checked;
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
            this.getRolePermissionList(data.id).then(() => {
                const items = this.rolePermissionList.map(item => item.id);
                this.permissionIdsAssigned = items;
                this.$refs.tree.setCheckedKeys(items);
            });
        },
        async update() {
            this.dialogVisible = false;
            const checked = this.$refs.tree.getCheckedKeys();
            // 取与permissionIdsAssigned集合的差集：
            // 要授予的权限；
            this.formData.assigning = getDifference(checked, this.permissionIdsAssigned);
            // 要移除的权限；
            this.formData.removing = getDifference(this.permissionIdsAssigned, checked);
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
        },
        async getRolePermissionList(roleId) {
            const resp = await getRolePermissionList(roleId);
            if (resp.code !== 0) {
                return this.$message.error("获取角色权限失败");
            }
            this.rolePermissionList = resp.data || [];
        }
    },
};
</script>

<style lang="scss" scoped>
.app-container {
    .roles-table {
        margin-top: 30px;
    }
    .permission-tree {
        margin-bottom: 30px;
    }
}
</style>
