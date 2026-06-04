const mysql = require('mysql2');

const db = mysql.createConnection({
    host:"localhost",
    user:'root',
    password:'password',
    database : 'task_app'
})

db.connect((err)=>{
    if(err){
        console.log('Database connection failed',err)
    }else{
        console.log('Mysql connected')
    }
})

module.exports = db;