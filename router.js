const fs = require('fs')
const express = require('express')
const Student = require('./student_mongo')   // 操作Student数据库
const Course = require('./course_mongo')  // 操作Course数据库 课程


const router = express.Router()  // 路由容器

var currentTeacherId = -1
var currentStudentId = -1
var currentCourseId = -1

router.get('/login',(req,res)=>{
    res.render('login.html')
})

router.post('/login',(req,res)=>{
    console.log("reqbody:",req.body)
    let loginBody = req.body
    if(loginBody.identity === 'student'){
        let url = '/students?id='+loginBody.id
        res.redirect(url)
    }else if(loginBody.identity === 'teacher'){
        if(loginBody.id === '10001'){
            res.redirect('/administrator/students')
        }else{
            let url = '/teacher?id='+loginBody.id
            res.redirect(url)
        }
    }
})

router.get('/administrator/students',(req,res)=>{
    Student.find(function(err,data){
        if(err){
            return res.status(500).send('server err')
        }else{
            // let students = JSON.parse(data).students
            console.log("students:",data)  // data : .students
            res.render('students_info.html',{
                students:data
            })
        }
    })
})

router.get('/administrator/courses',(req,res)=>{
    Course.find(function(err,data){
        if(err){
            return res.status(500).send('server err')
        }else{
            // let students = JSON.parse(data).students
            console.log("courses:",data)  // data : .students
            res.render('courses_info.html',{
                courses:data
            })
        }
    })
})

router.get('/teacher',(req,res)=>{  // 渲染我开设的课程页面
    console.log("teacher id:",req.query.id)
    let teacherId = req.query.id
    currentTeacherId = teacherId
    Course.find({ teacher_id:currentTeacherId.toString()},function(err,data){   // 根据教师id找课程
        if(err){
            return res.status(500).send('server err')
        }
        console.log("course data:",data)
        res.render('teacher.html',{
            courses:data
        })
    })
    
})

router.get('/teacher/new',(req,res)=>{  // 新课编辑页
    console.log("currTeacherId:",currentTeacherId)
    res.render('new_course.html')
})

router.post('/teacher/new',(req,res)=>{  // 开设新课
    let courseobj = req.body
    courseobj.teacher_id = currentTeacherId
    courseobj.credit = parseInt(courseobj.credit)
    console.log("courseObj:",courseobj)

    let newCourse = new Course(courseobj)
    newCourse.save(function(err){
        if(err){
            console.log(err)
            return res.status(500).send('server err')
        }else{
            let url = '/teacher?id='+currentTeacherId
            res.redirect(url) 
        }
    })
    
})

router.get('/teacher/course_detail',(req,res)=>{  // 教师查看课程详情：选课学生名单
    console.log("courseid:",req.query.course_id)
    currentCourseId = req.query.course_id

    Course.find({course_id:req.query.course_id},function(err,data){
        if(err){
            console.log(err)
            return res.status(500).send('server err')
        }else{
            let idArr = []
            for(let item of data[0].students){
                idArr.push(item.studeng_id)
            }
            console.log(idArr)
  
            Student.find(function(err,studata){
                if(err){
                    console.log("err:",err)
                }else{
                    console.log("student data:",studata)
                    let resObj = {students:[]}
                    for(let sid of idArr){
                        let filtered = {}
                        for(let item of studata){
                            if(item.student_id == sid){
                                let res = item.courses.filter(function(i){
                                    return i.course_id == req.query.course_id
                                })
                                filtered.course_score = parseInt(res[0].score)
                            }
                        }
                        console.log("test filtered:",filtered)
                    
                        for(let index in studata){
                            if(studata[index].student_id == sid){
                                filtered.detail = studata[index]
                            }
                        }
                        console.log("student info:",filtered)
                        
                        // console.log("filter0::",filtered.course_score)
                        // console.log("filtered:",filtered)
                        filtered.test = '1212'
                        console.log(filtered)
                    
                        resObj.students.push(filtered)
                    }
                    resObj.courseId = req.query.course_id
                    resObj.teacher_id = currentTeacherId

                    console.log("resObj:",resObj)
                    
                    
                    
                    res.render('course_detail.html',resObj)
                }
            })
        }
    })
    
})


router.get('/teacher/set_score',(req,res)=>{
    console.log("edit score")
    // res.render('login.html')
    let coid = req.query.course_id
    let stuid = req.query.student_id
    console.log("course id:",coid)
    console.log("student id:",stuid)

    Student.find({student_id:stuid},function(err,student){
        if(err){
            console.log(err)
            return res.status(500).send('Server err')
        }else{   
            console.log("thisstudent:",student)
            student[0].course_id = req.query.course_id
            res.render('edit_score.html',{
                thisStudent:student[0]
            })
        }
    })
})

router.post('/teacher/set_score',(req,res)=>{
    console.log("req.body:",req.body)
    let course_id = req.body.course_id
    let student_id = req.body.student_id
    let score = req.body.score
    Course.find({course_id:course_id},function(err,course){
        if(err){
            console.log(err)
            return res.status(500).send('Server err')
        }else{
            console.log("course data:",course)
            let students = course[0].students   // array
            
            for(let item of students){       // 根据id找学生 更新他的成绩
                if(item.studeng_id == student_id){
                    item.score = score
                }
            }
            console.log(students)
            Course.update({course_id:course_id},{students:students},function(err,data){
                if(err){
                    console.log(err)
                    return res.status(500).send('Server err')
                }else{
                    console.log("success")

                    // let url = '/teacher/course_detail?course_id='+currentCourseId
                    // res.redirect(url)
                }
            })
        }
    })


    Student.find({student_id:student_id},function(err,student){
        if(err){
            console.log(err)
            return res.status(500).send('Server err')
        }else{
            console.log("student info:",student)
            let courses = student[0].courses
            console.log("courses:",courses)
            for(let item of courses){       // 根据id找学生 更新他的成绩
                if(item.course_id == course_id){
                    item.score = score
                }
            }
            console.log(courses)
            Student.update({student_id:student_id},{courses:courses},function(err,data){
                if(err){
                    console.log(err)
                    return res.status(500).send('Server err')
                }else{
                    console.log("success")
                    let url = '/teacher/course_detail?course_id='+currentCourseId
                    res.redirect(url)
                }
            })

        }
    })
})


router.get('/students',(req,res)=> {
    console.log("stu req query id:",req.query.id)
    // console.log("current stu id:",currentStudentId)
    currentStudentId = req.query.id
    Course.find(function(err,data){    // 查询所有的课
        if(err){
            return res.status(500).send('server err')
        }else{     // 查询这个学生上的课：
            let enrolledCourses = []
            Student.find({student_id:currentStudentId},function(err,studoc){
                if(err){
                    console.log("err when finding enrolled courses:",err)
                }else{
                    console.log("this student info:",studoc)
                    for(let i of studoc[0].courses){
                        enrolledCourses.push(i)
                    }
                    console.log('enrolledCourses:',enrolledCourses)  //  [ { course_id: '0010', score: -1 }, { course_id: '1100', score: -1 } ]
                    // 根据课程号查课程信息
                    let resArr = []  // 课程的对象数组
                    for(let cid of enrolledCourses){
                        for(let item of data){
                            if(item.course_id == cid.course_id){
                                resArr.push(item)
                            }
                        }
                    }
                    let resObj = {courses:data}
                    resObj.enrolled_courses = resArr
                    resObj.student_id = req.query.id
                    console.log("resObj:",resObj)
            
                    res.render('index.html',resObj)
                }
            })
            // console.log("courses:",data)  // data : .students
        }
    })
})

router.get('/students/score_list',(req,res)=>{
    console.log(req.query.student_id)
    let student_id = req.query.student_id
    Student.find({student_id:student_id},function(err,data){
        if(err){
            return res.status(500).send('server err')
        }else{
            console.log("student->course data:",data[0].courses)
            let resObj = {courses:[]}
            Course.find(function(err,coursedata){
                if(err){
                    return res.status(500).send('server err')
                }else{
                    console.log("coursedata:",coursedata)
                    
                    for(let course of data[0].courses){   // course.course_id
                        let tempObj = {}
                        tempObj.course_id = course.course_id
                        tempObj.score = course.score
                        for(let item of coursedata){
                            if(item.course_id == course.course_id){
                                tempObj.detail = item
                            }
                        }
                        resObj.courses.push(tempObj)
                    }
                    resObj.student_id = req.query.student_id
                    console.log("resObj:",resObj)
                    res.render('score_page.html',resObj)
                }
            })
        }
    })
}) 

router.get('/students/enroll',(req,res)=>{    // 学生选课提交到/enroll 进行这些操作
    console.log("course_id:",req.query.course_id)
    console.log("student_id:",currentStudentId)

    // course 表中加入该学生信息
    Course.find({course_id:req.query.course_id},function(err,data){
        if(err){
            console.log(err)
        }else{
            console.log("temppppp:",data[0])
            let temp = data[0]
            console.log("temp.students",temp.students)
            let stuidArr = []
            for(let stuitem of temp.students){
                stuidArr.push(stuitem.studeng_id)
            }
            console.log("stuidArr:",stuidArr)

            if(stuidArr.indexOf(currentStudentId)<0){  // 课程数组里没这门课的课程号 则加入这门课的课程号
                temp.students.push({
                    studeng_id:currentStudentId,
                    score:-1
                })
                console.log("temp123:",temp)
            }else{
                console.log("1Already has this course.")
            }
            
            Course.findOneAndUpdate({course_id:req.query.course_id},temp,function(err,data){
                if(err){
                    console.log(err)
                    return res.status(500).send('server err')
                }else{
                    console.log('Successfully registered in the course table.')
                }
            })
        }
    })

    // 学生表中加入该课程信息
    Student.find({ student_id:currentStudentId.toString()},function(err,data){
        if(err){
            return res.status(500).send('server err')
        }else{
            console.log(data[0]) // the student object
            let temp = data[0]

            let coridArr = []
            for(let coritem of temp.courses){
                coridArr.push(coritem.course_id)
            }
            console.log("coridArr:",coridArr)

            if(coridArr.indexOf(req.query.course_id)<0){  // 课程数组里没这门课的课程号 则加入这门课的课程号
                temp.courses.push({
                    course_id:req.query.course_id,
                    score:-1
                })
                console.log("temp:",temp)
            }else{
                console.log("Already has this course.")
            }
            
            Student.findOneAndUpdate({ student_id:currentStudentId.toString()},temp,function(err,data){
                if(err){
                    console.log(err)
                    return res.status(500).send('server err')
                }else{
                    console.log('Successfully enrolled')
                }
            })
        }
    })

    let url = '/students?id='+currentStudentId
    res.redirect(url)

})

router.get('/students/new',(req,res)=>{
    res.render('new.html')
})


router.post('/students/new',(req,res)=>{    // 管理员新增学生信息 往这里post
    let stuobj = req.body 
    stuobj.gender = parseInt(stuobj.gender)
    console.log("stuobj:",req.body)
    
    let newStudent = new Student(stuobj)
    newStudent.save(function(err){
        if(err){
            return res.status(500).send('server err')
        }else{
            res.redirect('/administrator/students') 
        }
    })
})

router.get('/administrator/edit',(req,res)=>{    // 得到id显示他信息
    console.log("id:",req.query.id)  
    let id = req.query.id   // string类型

    Student.findById(id,function(err,student){
        if(err){
            return res.status(500).send('Server err')
        }else{   
            console.log("thisstudent:",student)
            res.render('edit.html',{
                thisStudent:student
            })
        }
    })
})

router.post('/administrator/edit',(req,res)=>{
    let stuobj = req.body
    console.log("stuobj:",stuobj)
    
    Student.findByIdAndUpdate(stuobj.id,stuobj,function(err){
        if(err){
            return res.status(500).send('Server err')
        }else{
            res.redirect('/administrator/students')
        }
    })
})

router.get('/administrator/delete',(req,res)=>{   // 管理员 学生信息删除
    console.log('delete id:',req.query.id)
    let id = req.query.id
    
    Student.findByIdAndRemove(id,(err)=>{
        if(err){
            return res.status(500).send('Server err')
        }else{
            res.redirect('/administrator/students')
        }
    })
})

router.get('/administrator/courses/delete',(req,res)=>{   // 管理员 课程信息删除
    console.log('delete id:',req.query.id)
    let id = req.query.id
    
    Course.findByIdAndRemove(id,(err)=>{
        if(err){
            return res.status(500).send('Server err')
        }else{
            res.redirect('/administrator/courses')
        }
    })
})

router.get('/teacher/delete',(req,res)=>{
    console.log("delete course id:",req.query.id)
    let id = req.query.id

    Course.findByIdAndRemove(id,(err)=>{
        if(err){
            return res.status(500).send('Server err')
        }else{
            url = '/teacher?id='+currentTeacherId
            res.redirect(url) 
        }
    })

})


router.get('/clear',(req,res)=>{
    console.log("whos your daddy")

    // Student.update({student_id:"1"},{courses:[]},function(err,data){
    //     if(err){
    //         console.log("update err:",err)
    //     }else{
    //         console.log("success update",data)
    //     }
    // })

    // Course.update({course_id:'1234'},{students:[]},function(err,data){
    //     if(err){
    //         console.log("update err:",err)
    //     }else{
    //         console.log("success update",data)
    //     }
    // })

    // res.redirect('/administrator/students')
})

// /teacher/course_detail?course_id={{$value.course_id}}

module.exports = router  //导出 router


