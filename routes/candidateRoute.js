
const express = require('express')
const db = require("../db/db.connection")
const candidateRoutes = express.Router();
const upload = require("../middleware/uploads");
const fs = require("fs");
const path = require("path");

candidateRoutes.get("/",async(req,res)=>{
    const sql = 'SELECT * FROM candidate'
    db.query(sql,[],(err,result)=>{
        if(err){
            return res.status(400).json({error:err.sqlMessage})
        }
        res.json(result)
    })
})
 candidateRoutes.post("/",(req,res, next)=>{
  console.log("Content-Type:", req.headers["content-type"]);
  next();
},upload.single("resume"),async(req,res)=>{
    const {name,email,contact,jobDes,status,date} = req.body
    console.log("BODY:", req.body);
console.log("FILE:", req.file);
    const resume = req.file
  ? `uploads/resumes/${req.file.filename}`
  : null;
    console.log(resume)
    const sql = 'INSERT INTO candidate (name,email,contact,jobDes,status,date,resume) VALUES (?,?,?,?,?,?,?)'
    db.query(sql,[name,email,contact,jobDes,status,date,resume],(err,result)=>{
        if(err){
            return res.status(400).json({error:err.sqlMessage})
        }
        res.status(201).json({id:result.insertId,name,email,contact,jobDes,status,date,resume})
    })
})

candidateRoutes.delete("/:id",async(req,res)=>{
    const id = req.params.id;
    const sql = `DELETE FROM candidate WHERE id = ?`
      db.query(
    "SELECT resume FROM candidate WHERE id=?",
    [id],
    (err, result) => {
      if (err)
        return res.status(400).json({ error: err.sqlMessage });

      if (result.length > 0 && result[0].resume) {
        const filePath = path.join(
          __dirname,
          "..",
          result[0].resume
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

    db.query(sql,[id],(err,result)=>{
        if(err){
            return res.status(400).json({error:err.sqlMessage})
        }
        res.status(200).json({message:"Deleted Successfully"})
    })
})
})
candidateRoutes.put("/:id",upload.single("resume"),async(req,res)=>{
    const id = req.params.id;
    const sql = `UPDATE candidate SET ? WHERE id=?`

    db.query(
  "SELECT resume FROM candidate WHERE id=?",
  [id],
  (err, result) => {
    if (err) return res.status(400).json({ error: err.sqlMessage });

    const updateData = req.body;

    if (req.file) {
      // old resume delete
      if (result[0]?.resume) {
        const oldFile = path.join(__dirname, "..", result[0].resume);

        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }

      updateData.resume = `uploads/resumes/${req.file.filename}`;
    }

    db.query(sql,[updateData,id],(err,result)=>{
        if(err){
            return res.status(400).json({error:err.sqlMessage})
        }
        const selectedSql = 'SELECT * FROM candidate WHERE id=?'
        db.query(selectedSql,[id],(err,data)=>{
            if(err){
                return res.status(400).json({error:err.sqlMessage})
            }
            console.log(data)
            res.status(200).json(data[0])
        })
    
        
    })
})
})
module.exports = candidateRoutes