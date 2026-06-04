const express = require('express');
const db = require('../db/db.connection');
const jobRoutes = express.Router();

jobRoutes.get("/",async(req,res)=>{
    const sql = 'SELECT * FROM jobDescription';
    db.query(sql,(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        res.json(result)
    })
}
)
jobRoutes.post("/",async(req,res)=>{
    const {title, client,requirements ,employee,date} = req.body;
    const sql = 'INSERT INTO jobDescription (title, client, requirements, employee,date) VALUES(?,?,?,?,?)';
    db.query(sql,[title,client,requirements,employee,date],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        res.status(201).json({id:result.insertId,title,client,requirements,employee,date })
    })
})
jobRoutes.put("/:id",async(req,res)=>{
    const id = req.params.id;
    const updateData = req.body;
    const sql = 'UPDATE jobdescription SET ? WHERE id=?';
    db.query(sql,[updateData,id],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage});
        }
        res.status(200).json(updateData);
    })
})
jobRoutes.delete("/:id",async(req,res)=>{
    const id = req.params.id;
    const sql = `DELETE FROM jobDescription WHERE id=?`
    db.query(sql,[id],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        res.status(200).json({message:"Deleted successfully"})
    })

})
module.exports = jobRoutes