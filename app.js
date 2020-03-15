const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')

var router = require('./router')
var app = express()


app.use(bodyParser.urlencoded({extended:false}))  // 使用bodyparser
app.use(bodyParser.json())

//配置模版引擎
app.engine('html',require('express-art-template'))  // automatically browse /views

// 路由容器挂载app服务中
app.use(router)  

// 公开目录
app.use('/node_modules',express.static('./node_modules'))
app.use('/public',express.static('./public'))


app.listen(3000,function(){
    console.log('app is running at 3000')
})

