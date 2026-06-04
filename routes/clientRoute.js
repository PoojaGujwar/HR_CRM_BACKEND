
const express = require('express')
const db = require("../db/db.connection")
const clientRoutes = express.Router();

clientRoutes.get("/",async(req,res)=>{
    const sql = 'SELECT * FROM client'
    db.query(sql,(err,result)=>{
        if(err){
            return res.status(403).json({error:err.sqlMessage})
        }
        res.json(result)
    })
})

clientRoutes.post("/",async(req,res)=>{
    const {name, email, contact, state, city, country,website,companyName,companyAddress, companyType} = req.body;

    const sql = `INSERT INTO client(name, email, contact, state, city, country,website,companyName,companyAddress, companyType) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    db.query(sql,[name, email, contact, state, city, country,website,companyName, companyAddress, companyType],(err,result)=>{
        if(err){
            return res.status(400).json({error:err.sqlMessage})
        }
         res.status(201).json({
                id: result.insertId,
                name,
                email,
                contact,
                state,
                city,
                country,
                website,
                companyName,
                companyAddress,
                companyType
            })
    })
})

clientRoutes.put("/:id",async(req,res)=>{
const id = req.params.id;
const updatedData = req.body
const sql = `UPDATE client SET ? WHERE id=?`
db.query(sql,[updatedData,id],(err,result)=>{
    if(err){
        return res.status(400).json({error:err.sqlMessage})
    }
    res.status(200).json({message:"Updated Data successfully",data:updatedData})
})
})

clientRoutes.delete("/:id",async(req,res)=>{
    const idN = req.params.id;
    const sql = 'DELETE FROM client WHERE id=?'
    db.query(sql,[idN],(err,result)=>{
        if(err){
            return res.status(400).json({error:err.sqlMessage})
        }
        res.status(200).json({message:"Client delete successfully",data:result})
    })
})

module.exports = clientRoutes;
