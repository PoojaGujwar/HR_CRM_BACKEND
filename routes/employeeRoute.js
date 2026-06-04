const express = require("express");
const employeeRoute = express.Router();
const db = require("../db/db.connection")
const bcrpt = require("bcrypt")

employeeRoute.get("/",async(req,res)=>{
    const sql = 'SELECT * FROM employee where isDelete=?';
    db.query(sql,[false],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        return res.json(result)
    })
})
employeeRoute.post("/",async(req,res)=>{
    const {name,email,password,contact,role,status, joiningDate} = req.body;
    const hashPass = await bcrpt.hash(password,10)
    const sql = "INSERT INTO employee (name,email,password,contact,role,status,joiningDate) VALUES (?,?,?,?,?,?,?)";
    db.query(sql,[name,email,hashPass,contact,role,status,joiningDate],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        res.status(201).json({id:result.insertId,name,email,contact,role,status,joiningDate})
    })
})

employeeRoute.put("/:id",async(req,res)=>{
    const updatedData = req.body;
    const hashPass = await bcrpt.hash(updatedData.password,10)
    const id = req.params.id;
    const sql = 'UPDATE employee SET ? WHERE id=?'
    db.query(sql,[updatedData,id],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.errMessage})
        }
        res.status(200).json(updatedData)
    })
})

employeeRoute.delete("/:id",async(req,res)=>{
    const id = req.params.id;
    const sql = 'Update employee SET isDelete = ?  WHERE id=?';
    db.query(sql,[true,id],(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        res.status(200).json({message:"Delete successfully"})
    })
})

module.exports = employeeRoute