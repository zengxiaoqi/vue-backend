<template>
    <div>
        <el-form :inline="true">
            <el-form-item>
                <el-select v-model="type" placeholder="选择格式化类型">
                    <el-option label="XML" value="xml"></el-option>
                    <el-option label="JSON" value="json"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="formatStr">格式化</el-button>
            </el-form-item>
        </el-form>
        <el-row>
            <el-col :span="10">
                输入字符串：
                <el-input type="textarea" :rows="20" v-model="inputStr" ></el-input>
            </el-col>
            <el-col :span="10">
                输出字符串：
                <el-input type="textarea" :rows="20" v-model="outputStr" ></el-input>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "StrFormat",
    data() {
        return {
            type: "",
            inputStr: "",
            outputStr: "",
        }
    },
    methods: {
        formatStr(){
            if(this.type == ""){
                this.$message.info("请选择格式化类型")
                return;
            }
            if(this.inputStr == ""){
                this.$message.info("请输入要解析的字符串")
                return;
            }
            this.$axios({
                url: '/formatStr',
                type: 'post',
                data: {
                    "inputStr": this.inputStr,
                    "type": this.type
                }
            }).then(res => {
                if(res.success){
                    this.outputStr = res.data.outputStr;
                }else {
                    this.$message.error("解析失败")
                }
            }).catch(err => {
                this.$message.error(`获取数据失败，失败码：${err}`)
            })
        }
    }
}
</script>

<style scoped>

</style>
