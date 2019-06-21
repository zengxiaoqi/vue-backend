<template>
<div>
    <!-- 搜索 -->
    <app-search>
        <el-form :inline="true" :model="searchForm">
            <el-form-item>
                <el-select v-model="searchForm.type" placeholder="下拉选择">
                    <el-option label="IP" value="ip"></el-option>
                    <el-option label="端口" value="port"></el-option>
                    <el-option label="状态" value="statue"></el-option>
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
    <!--<app-toolbar>
        <el-button type="primary" @click="addTcpServer" >新增</el-button>
        <el-button type="primary" v-hasPermission="'edit'">修改</el-button>
    </app-toolbar>-->
    <el-button type="primary" @click="addTcpServer" >新增</el-button>
    <el-button type="primary" @click="addTcpServer" >启动监听</el-button>
    <el-button type="primary" @click="addTcpServer" >停止监听</el-button>
    <el-button type="primary" @click="sendData" >发送数据</el-button>
    <el-row>
        <el-col :span="12">
            <!-- 表格体 -->
            <table-mixin pagination paginationAlign="center" style="width:500px">
                <el-table v-loading="tableData.loading" :data="tableData.body" border :default-sort="{prop: 'index', order: 'descending'}"
                          highlight-current-row
                          @current-change="rowClick">
                    <el-table-column type="index" label="序号" width="64" align="center"></el-table-column>
                    <!--<el-table-column v-for="(item,index) in tableData.head" :prop="item.key" :label="item.name" sortable :key="index"></el-table-column>-->
                    <el-table-column prop="id" label="ID" align="center"></el-table-column>
                    <el-table-column prop="port" label="端口" align="center" sortable></el-table-column>
                    <el-table-column prop="statue" label="状态" align="center" sortable></el-table-column>
                    <!--<el-table-column label="操作" align="center" >
                        <template slot-scope="scope" >
                            <el-button  size="mini" @click="handleEdit(scope.$index, scope.row,false)" >启动监听</el-button>
                            <el-button  size="mini" @click="handleEdit(scope.$index, scope.row,false)" >停止监听</el-button>
                        </template>
                    </el-table-column>-->
                </el-table>
            </table-mixin>
        </el-col>
        <!--<el-col :span="4">
            <el-divider direction="vertical" style="color: #303133"></el-divider>
        </el-col>-->
        <el-col :span="12">
            <el-form :model="editFormModel" label-width="80px" :rules="editFormRules" ref="editFormModel"
                     style="width:600px" :visible.sync="hasRowSelect">
                <el-form-item label="接收消息：" prop="recvMsg" label-width="100px">
                    <el-input type="textarea" :rows="10" v-model="recvMsg" :readonly="readonly"></el-input>
                </el-form-item>
                <el-form-item label="发送消息：" prop="sendMsg" label-width="100px">
                    <el-input type="textarea" :rows="10" clearable v-model="sendMsg"></el-input>
                    <el-checkbox v-model="checkedHex">HEX</el-checkbox>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>

    <!--编辑弹框-->
    <el-col :span="24">
        <el-dialog :title="title" :visible.sync="editFormVisible" :close-on-click-modal="true" top>
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
import { mapState } from "vuex";

export default {
    name: "TcpServer",
    data() {
        return {
            searchForm: {
                type: '',
                text: ''
            },
            tableData: {
                loading: true,  //v-loading在接口为请求到数据之前，显示加载中，直到请求到数据后消失
                head: [],
                body: []
            },
            //显示或隐藏编辑页面
            editFormVisible: false,
            //提交按钮是否禁用
            disabledBool: false,
            title: "新建服务端",
            titleTip: "TCP SERVER",
            defaultValues: {
                id: "",
                port: ""
            },
            //form表单绑定的对象
            editFormModel: {
                id: "",
                port: "",
                statue: "",
                recvMsg: "",
                sendMsg: "",
            },
            tmpServerInfo: {
                id: "",
                port: "",
                statue: "",
                recvMsg: "",
                sendMsg: "",
            },
            //弹框form表单校验规则
            editFormRules: {
                id: [{ required: true, message: "该输入项为必填项!" }],
                port: [{ required: true, message: "该输入项为必填项!" }],
            },
            readonly: false,
            hasRowSelect: false,
            currentRow: null,
            checkedHex: false,
            //serverInfo: new Map(), //Map 保存连接信息 Key=id value=tmpServerInfo
            sendMsg: "",
            recvMsg: "",
        }
    },
    mounted() {
        this.getTableData()
    },
    computed: {
        ...mapState(["serverInfo"])
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
                res.body.forEach((value)=> {
                    this.$store.commit("setServerInfo", value)
                })
            }).catch(err => {
                this.$message.error(`获取数据失败，失败码：${err}`)
            })
        },
        search(){
            console.log(`欲提交的数据   日期:${this.searchForm.time}  下拉条件:${this.searchForm.type}  文本: ${this.searchForm.text}`)
        },
        addTcpServer(index, row) {
            let _this = this;
            //调用公用编辑界面方法
            _this.handleEdit(index, row, true);
        },
        //显示编辑界面
        handleEdit: function(index, row, flag) {
            let _this = this;
            _this.isAdd = flag;

            if (_this.$refs.editFormModel != undefined) {
                _this.$refs.editFormModel.resetFields();
            }
            _this.editFormModel = _this.defaultValues; //弹框默认值
            if (row) {
                _this.readonly = true;
                _this.$nextTick(() => {
                    _this.editFormModel = Object.assign({}, row);
                });
            } else {
                _this.readonly = false;
            }
            _this.editFormVisible = true;

        },
        submit() {
            let _this = this;
            let model = _this.$refs.editFormModel.model;

            _this.setModel2Object(model);
            _this.$store.commit("setServerInfo", _this.tmpServerInfo)
            //_this.serverInfo.set(model.id, _this.tmpServerInfo);  //保存服务信息

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
                        url = "/updateServer";
                        _this.commonSubmit("put", url, model, params, "提交成功", "提交失败");
                    }
                }
            });
        },
        //公用提交方法   reqType:提交方式   url:提交路径   model:form表单数据   params：其他参数,默认为空  sucessMsg:成功信息  failMsg：失败信息
        commonSubmit(reqType, url, model, params, sucessMsg, failMsg) {
            let _this = this;
            _this
                .$axios({
                    method: reqType,
                    url: url,
                    data: model,
                    params: params
                })
                .then(function(res) {
                    if (res.data.success) {
                        _this.$message({
                            message: sucessMsg || "sucessful",
                            type: "success"
                        });
                        _this.editFormVisible = false;
                        _this.disabledBool = false;
                        _this.getTableData();
                    } else {
                        _this.$message({
                            message:
                            res.data.message || failMsg || "submitFailed",
                            type: "error"
                        });
                    }
                });
        },
        rowClick(row) {
            let _this = this;
            //根据选中行的ID找到发送消息框和接收消息框的对应关系
            console.log("---------"+row["id"]);
            _this.currentRow = row;
            _this.hasRowSelect = true;
        },
        setModel2Object(model) {
            let _this = this;
            _this.tmpServerInfo.id = model.id;
            _this.tmpServerInfo.port = model.port;
        },
        sendData() {
            let _this = this;
            if(_this.currentRow == null){
                _this.$message({
                    type: 'info',
                    message: '请选择一行数据'
                });
                return;
            }
            var Id = _this.currentRow["id"];
            var tmpDate = _this.serverInfo.get(Id);
            tmpDate.sendMsg = _this.sendMsg;
            let url = "";
            let params = {};
            url = "/sendData";
            _this.commonSubmit(
                "post",
                url,
                tmpDate,
                params,
                "发送成功",
                "发送失败"
            );
        },
    },
}
</script>

<style scoped>

</style>
