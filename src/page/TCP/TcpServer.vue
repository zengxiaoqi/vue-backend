<template>
<div>
    <!-- 搜索 -->
    <app-search>
        <el-form :inline="true" :model="searchForm">
            <el-form-item>
                <el-date-picker v-model="searchForm.time" type="date" placeholder="选择日期"></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-select v-model="searchForm.type" placeholder="下拉选择">
                    <el-option label="选项一" value="选项一"></el-option>
                    <el-option label="选项二" value="选项二"></el-option>
                    <el-option label="选项三" value="选项三"></el-option>
                    <el-option label="选项四" value="选项四"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-input v-model="searchForm.text" placeholder="请输入查询条件"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">查询</el-button>
            </el-form-item>
        </el-form>
    </app-search>
    <!-- 工具条 -->
    <app-toolbar>
        <el-button type="primary" @click="addTcpServer" >新增</el-button>
        <el-button type="primary" v-hasPermission="'edit'">修改</el-button>
    </app-toolbar>
    <!-- 表格体 -->
    <table-mixin pagination paginationAlign="center">
        <el-table v-loading="tableData.loading" :data="tableData.body" border :default-sort="{prop: 'date', order: 'descending'}">
            <el-table-column type="index" label="序号" width="64" align="center"></el-table-column>
            <!--<el-table-column v-for="(item,index) in tableData.head" :prop="item.key" :label="item.name" sortable :key="index"></el-table-column>-->
            <el-table-column prop="ip" label="IP" align="center"></el-table-column>
            <el-table-column prop="port" label="端口" align="center" sortable></el-table-column>
            <el-table-column prop="statue" label="状态" align="center" sortable></el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.operation.indexOf('edit') >= 0" type="text" size="small">查看</el-button>
                    <el-button v-if="scope.row.operation.indexOf('delete') >= 0" type="text" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </table-mixin>

    <!--编辑弹框-->
    <el-col :span="24">
        <el-dialog :title="title" :visible.sync="editFormVisible" :close-on-click-modal="true" v-dialogDrag>
            <!--el-form 的ref值必须为editForm -->
            <el-form :model="editFormModel" label-width="80px" :rules="editFormRules" ref="editFormModel">
                <el-col :span="12">
                    <el-form-item label="主键名称：" prop="id" label-width="100px">
                        <el-input clearable v-model="editFormModel.id" :readonly="readonly"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="端口：" prop="port" label-width="100px">
                        <el-input clearable v-model="editFormModel.port"></el-input>
                    </el-form-item>
                </el-col>
            </el-form>
            <span slot="footer" class="ec-dialog-footer">
          <el-button size="small" v-bind:disabled="disabledBool" type="primary" @click="submit">提交</el-button>
          <el-button size="small" @click="editFormVisible=false">取消</el-button>
        </span>
        </el-dialog>
    </el-col>
</div>
</template>

<script>
export default {
    name: "TcpServer",
    data() {
        return {
            searchForm: {
                time: '',
                type: '',
                text: ''
            },
            tableData: {
                loading: true,
                head: [],
                body: []
            },
            //显示或隐藏编辑页面
            editFormVisible: false,
            //提交按钮是否禁用
            disabledBool: false,
            title: "新建服务端",
            //form表单绑定的对象
            editFormModel: {
                id: "",
                port: "",
            },
            //弹框form表单校验规则
            editFormRules: {
                id: [{ required: true, message: "该输入项为必填项!" }],
                port: [{ required: true, message: "该输入项为必填项!" }],
            },
        }
    },
    mounted() {
        this.getTableData()
    },
    methods: {
        // 获取table数据
        getTableData() {
            this.$axios({
                url: '/TcpServerData',
                type: 'post',
                data: {}
            }).then(res => {
                this.tableData.loading = false
                this.tableData.head = res.head
                this.tableData.body = res.body
            }).catch(err => {
                this.$message.error(`获取数据失败，失败码：${err.response.status}`)
            })
        },
        search(){
            console.log(`欲提交的数据   日期:${this.searchForm.time}  下拉条件:${this.searchForm.type}  文本: ${this.searchForm.text}`)
        },
        addTcpServer() {

        },
        submit() {
            let _this = this;
            let model = _this.$refs.editFormModel.model;

            _this.$refs.editFormModel.validate(valid => {
                if (valid) {
                    let url = "";
                    let params = {};
                    if (_this.isAdd) {
                        url = "/createServer";
                        _this.commonSubmit(
                            "post",
                            url,
                            model,
                            params,
                            "提交成功",
                            "提交失败"
                        );
                    } else {
                        params["id"] = model["id"];
                        url = "/route/update";
                        _this.commonSubmit("put",url,model,params,"提交成功","提交失败");
                    }
                }
            });
    }
}
</script>

<style scoped>

</style>
