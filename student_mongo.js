var mongoose = require('mongoose')
var Schema = mongoose.Schema

// 连接数据库
mongoose.connect('mongodb://localhost/students', {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var studentSchema = new Schema({
    name: {
        type:String,
        required:true
    },
    gender:{
        type:Number,
        required:true,
        enum:[0,1],
        default:0
    },
    age:{
        type:Number,
        required:true
    },
    major:{
        type:String,
        required:false
    },
    student_id:{
        type:String,
        required:true
    },
    courses:{
        type:Array
    }
})


module.exports = mongoose.model('Student',studentSchema)



