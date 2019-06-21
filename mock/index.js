import Mock from 'mockjs'
import navlist from './navlist'
import login from './login'
import echarts from './echarts'
import table from './table'
import groupList from './groupList'
import getToken from './getToken'
import tcpServerData from './tcpServerData'
import createServer from './createServer'

let data = [].concat(navlist, login, echarts, table, groupList, getToken, tcpServerData,createServer)

data.forEach(function(res){
    Mock.mock(res.path, res.data)
})

export default Mock
