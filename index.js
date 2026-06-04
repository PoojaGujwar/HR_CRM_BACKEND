const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db/db.connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("./middleware/verifyToken");
const clientRoutes = require("./routes/clientRoute");
const candidateRoutes = require("./routes/candidateRoute");
const employeeRoute = require("./routes/employeeRoute");
const jobRoutes = require("./routes/jobDescription");
const SECRET_KEY = "your_secret_key";
const port = 4001;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { error } = require("console");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gujwarpooja@gmail.com",
    pass: "qeob mbyn lihu qwjv",
  },
});

app.use(express.json());
app.use(
  cors({
    origin: "*",
    method: ["GET", "POST"],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);
app.get("/dash", verifyToken, (req, res) => {
  console.log("Comome");
  res.send("Hello mysql");
});
app.post("/register", async (req, res) => {
  const { name, email, password, role, state, city, country } = req.body;
  const hashPass = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (name, email, password, role, state, city, country) VALUES(?,?,?,?,?,?,?)`;

  db.query(
    sql,
    [name, email, hashPass, role || "employee", state, city, country],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.sqlMessage });
      }
      res.status(201).json({
        message: "User register succeffully",
        userId: result.insertId,
      });
    },
  );
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const sql = `SELECT * FROM employee WHERE email = ? `;
  const emailTrim = email.trim();
  db.query(sql, [emailTrim], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Somethings went wrong" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    // const isMatch = await(password === result[0].password);
    const isMatch = await bcrypt.compare(password,result[0].password)
    console.log(isMatch);
    if (isMatch === true) {
      const token = jwt.sign(
        { id: result[0].id, role: result[0].role },
        SECRET_KEY,
        { expiresIn: "1h" },
      );
      return res
        .status(200)
        .json({
          message: "Login successfully",
          token,
          userInfo: {
            id: result[0].id,
            name: result[0].name,
            email,
            role: result[0].role,
          },
        });
    } else {
      return res.status(401).json({ message: "Password incorrect" });
    }
  });
});
app.get("/profile", verifyToken, async (req, res) => {
  const userId = req.user.id;
  console.log(userId)
  const sql =
    "SELECT id, name, email, role, status, contact, joiningDate FROM employee where id=? && isDelete=? ";
  db.query(sql, [userId,false], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Server error",
      });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(result[0]);
  });
});

app.put("/profile/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  const sql = `UPDATE employee SET name=?,email=? WHERE id=?`;
  db.query(sql, [name, email, id], (err, result) => {
    console.log(err);
    if (err) {
      return res.status(500).json({ message: "Server error" });
    }
    res.json({ message: "Profile updated successfully" });
  });
});
app.patch("/profile/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  console.log(id, req.body);
  const { currentPass, newPassword } = req.body;

  const hashPass = await bcrypt.hash(currentPass, 10);
  const sql = `SELECT * FROM employee WHERE id=?`;
  db.query(sql, [id], async (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    console.log(result.length,"KOI NHI");
    if (result.length === 0) {
      console.log(result.length);
      return res.status(400).json({ message: "Not Found" });
    }
    let isMatch = await bcrypt.compare(currentPass, result[0].password);
    // let isMatch = await currentPass === result[0].password
    console.log("isMatch", isMatch);
    if (isMatch) {
      const newHashPass = await bcrypt.hash(newPassword, 10);
      console.log("New Pass", newHashPass);
      console.log(isMatch)
      const updateSql = `UPDATE employee SET password =? WHERE id=?`;
      db.query(updateSql, [newHashPass, id], (err1, result1) => {
        if (err) {
          return res.status(500).json({ message: "Password is not updated." });
        }
        res.status(200).json({ message: "Password updated successfully" });
      });
    } else {
      return res.status(400).json({ message: "Invalid Password" });
    }
  });
 
});
app.post("/forget", async (req, res) => {
  const { email } = req.body;
  const sql = `SELECT * FROM users WHERE email = ? `;
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Somethings went wrong" });
    }
    if (result.length === 0) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }
    console.log(result);
    const token = crypto.randomBytes(32).toString("hex");

    //expire time
    const expireTime = new Date(Date.now() + 15 * 60 * 1000);
    const sqlUpdate = `UPDATE users SET reset_token =?, token_expiry=? WHERE email=?`;
    db.query(sqlUpdate, [token, expireTime, email], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Failed to process request" });
      }
      const resetLink = `http://localhost:5173/reset-password?token=${token}`;
      console.log(resetLink);
      const mailOptions = {
        from: "gujwarpooja@gmail.com",
        to: email,
        subject: "Password Reset Request",
        html: `<p>Aapne password reset request ki hai.</p>
                       <p>Niche diye gaye link par click karke apna password badlein (Valid for 15 mins):</p>
                       <a href="${resetLink}">${resetLink}</a>`,
      };
      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          return res.status(500).json({ error: "Failed to send email" });
        }
      });
      res.json({ message: "Reset link sent to your email successfully" });
    });
  });
});
app.post("/reset-password", async (req, res) => {
  const token = req.body.token;
  const newPassword = req.body.newPassword;
  console.log(token, newPassword);
  const sql = `SELECT * FROM users where reset_token=?`;
  db.query(sql, [token], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Something went wrong" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    let id = result[0].id;
    let hashPass = await bcrypt.hash(newPassword, 10);
    let passUpdateSql = `UPDATE users SET password =? WHERE id =?`;
    db.query(passUpdateSql, [hashPass, id], (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Something wend wrong", error: err });
      }
      console.log("Password Updated");
      res.status(200).json("Password Updated Successfully");
    });
  });
});
app.get("/countries",async(req,res)=>{
  const sql = `SELECT id, name FROM countries`
  db.query(sql,(err,result)=>{
    if(err){
      return res.status(500).json({message:"Internal server error"})
    }
    res.status(202).json(result)
  })
})
app.get("/states",async(req,res)=>{
  const sql = `SELECT id, name FROM states`
  db.query(sql,(err,result)=>{
    if(err){
      res.status(500).json({message:"Hello"})
    }
    res.json(result)
    console.log(result)
  })
})
app.use("/uploads", express.static("uploads"));
app.use("/client", clientRoutes);
app.use("/candidate", candidateRoutes);
app.use("/employee",employeeRoute);
app.use("/jobDes", jobRoutes);

app.listen(port, () => {
  console.log(`Server is runnig on port ${port}`);
});
