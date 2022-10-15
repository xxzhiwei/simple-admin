<template>
    <div class="app-container">
        <div style="margin-bottom: 10px;">
            <div style="margin-bottom: 10px;">
                <el-button type="primary" size="small" @click="showDialogForAdding()">新增权限</el-button>
                <!-- <el-button type="danger" size="small">删除权限</el-button> -->
            </div>
            <div>
                <el-tag type="success">
                    <span style="margin-right: 10px;">
                        <i class="el-icon-menu" /> 菜单权限
                    </span>
                    <span>
                        <i class="el-icon-position"></i> 操作权限
                    </span>
                </el-tag>
            </div>
        </div>
        <el-tree :data="list" node-key="id" default-expand-all :expand-on-click-node="false">
            <span slot-scope="{ data }">
                <span style="font-size: 14px;">
                    <i v-if="data.type === 1" class="el-icon-menu" />
                    <i v-else class="el-icon-position" />
                    {{ data.name }}
                </span>
                <span style="margin-left: 10px;">
                    <el-button v-if="data.type === 1" type="text" size="mini" @click="() => showDialogForAdding(data)">
                        添加
                    </el-button>
                    <el-button type="text" size="mini" @click="() => showDialogForEditing(data)">
                        修改
                    </el-button>
                    <el-button type="text" style="color: #f56c6c" size="mini" @click="() => del(data)">
                        删除
                    </el-button>
                </span>
            </span>
        </el-tree>

        <el-dialog :title="isEditing ? '编辑权限' : '新增权限'" :visible.sync="dialogVisible" width="45%">
            <el-form :model="formData" label-width="80px">
                <el-form-item label="父级">
                    <el-popover ref="popover" placement="bottom-start" trigger="click">
                        <el-tree ref="menuTree" :data="menu" :props="props" node-key="id" @current-change="currentChange" :default-expand-all="true" :highlight-current="true" :expand-on-click-node="false">
                        </el-tree>
                    </el-popover>
                    <el-input v-model="formData.parentName" v-popover:popover :readonly="true" placeholder="" :disabled="isEditing"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-radio :disabled="isEditing" v-model="formData.type" :label="1">菜单权限</el-radio>
                    <el-radio :disabled="isEditing" v-model="formData.type" :label="2">操作权限</el-radio>
                </el-form-item>
                <el-form-item label="名称">
                    <el-input v-model="formData.name"></el-input>
                </el-form-item>
                <el-form-item label="权限码">
                    <el-input v-model="formData.value"></el-input>
                </el-form-item>
                <el-form-item label="路径" v-if="formData.type === 1">
                    <el-input v-model="formData.path"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" v-if="isEditing" @click="update">确 定</el-button>
                <el-button type="primary" v-else @click="save">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {
    getList,
    save,
    update,
    del,
} from "@/api/permission";
import { copyProperties } from '@/utils/common.js';

const defaultFormData = {
    id: "",
    type: 1,
    value: "",
    name: "",
    path: "",
    parentId: -1,
    // extra: "", // json数据【要做防xss攻击？】
    parentName: "",
};

const extraOption = {
    id: -1,
    value: "1",
    name: "根节点",
    parentId: -1,
    children: []
}

function getMenu(permissionList) {
    const p = permissionList.filter((p) => {
        if (p.type === 1) {
            if (p.children && p.children.length) {
                p.children = getMenu(p.children);
            }
            return true;
        }
        return false;
    });
    p.unshift(extraOption);
    return p;
}

export default {
    data() {
        return {
            list: [],
            props: {
                label: "name",
                children: "children",
            },
            formData: {
                ...defaultFormData,
            },
            isEditing: false,
            dialogVisible: false,
            tempType: null
        };
    },
    computed: {
        menu() {
            if (!this.list.length) {
                return [];
            }
            // [].filter()本身不会修改数组，但是在getMenu()方法里直接对传入的数组做修改了，因此这里使用深复制再对其进行操作
            return getMenu(JSON.parse(JSON.stringify(this.list)));
        },
    },
    created() {
        this.getList();
    },
    methods: {
        async getList() {
            const resp = await getList();
            if (resp && resp.code !== 0) {
                return this.$message.error(resp.message);
            }
            this.list = resp.data;
        },
        showDialogForAdding(data) {
            this.isEditing = false;
            this.formData = { ...defaultFormData };
            if (this.tempType != null) {
                this.formData.type = this.tempType;
            }
            if (data) {
                this.formData.parentId = data.id;
                this.formData.parentName = data.name;
                this.$nextTick(() => {
                    this.$refs.menuTree.setCurrentKey(this.formData.parentId);
                });
            }
            else {
                this.formData.parentName = extraOption.name;
                this.$nextTick(() => {
                    this.$refs.menuTree.setCurrentKey(-1);
                });
            }
            this.dialogVisible = true;
        },
        async save() {
            this.dialogVisible = false;
            const resp = await save(this.formData).catch((error) => {
                console.log(error);
            });
            if (resp.code !== 0) {
                this.$message.error("操作失败");
                return;
            }
            this.tempType = this.formData.type;
            this.$message.success("操作成功");
            this.getList();
        },
        showDialogForEditing(data) {
            this.isEditing = true;

            this.formData = copyProperties(data, { ...defaultFormData })

            this.dialogVisible = true;
            // 非根权限
            if (this.formData.parentId) {
                this.$nextTick(() => {
                    this.$refs.menuTree.setCurrentKey(this.formData.parentId);
                    this.formData.parentName =
                        (this.$refs.menuTree.getCurrentNode() || {})["name"];
                });
            }
        },
        async update() {
            this.dialogVisible = false;
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
            this.getList();
        },
        del(data) {
            this.$confirm("确认删除吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
            }).then(async () => {
                const resp = await del({ id: data.id }).catch(
                    (error) => {
                        console.log(error);
                    }
                );
                if (resp.code !== 0) {
                    this.$message.error("操作失败");
                    return;
                }
                this.$message.success("操作成功");
                this.getList();
            });
        },
        currentChange(data) {
            this.formData.parentId = data.id;
            this.formData.parentName = data.name;
            this.$refs.popover.doClose();
        },
    },
};
</script>