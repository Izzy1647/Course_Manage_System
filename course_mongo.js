// 课程表

var mongoose = require('mongoose')   
var Schema = mongoose.Schema

mongoose.connect('mongodb://localhost/courses', {useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var courseSchema = new Schema({
    course_id:{
        type:String,
        required:true
    },
    course_name:{
        type:String,
        required:true
    },
    credit:{
        type:Number,
        required:true
    },
    teacher_id:{
        type:String,
        required:true
    },
    students:{
        type:Array
    }
})


module.exports = mongoose.model('Course',courseSchema)