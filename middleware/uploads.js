const { error } = require("console");
const multer = require("multer");
const path = require("path");

const fs = require("fs");

const uploadPath = path.join(__dirname, "../uploads/resumes");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
console.log("Upload Path:", uploadPath);
console.log("Exists:", fs.existsSync(uploadPath));

console.log("__dirname =", __dirname);
console.log("uploadPath =", uploadPath);

// const storage = multer.diskStorage({
//     destination:(req,file,cd)=>{
//         cd(null,"uploads/resumes")
//     },

//     filename:(req,file,cd)=>{
//         cd(null,Date.now()+"-"+file.originalname)
//     }
// })
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
 console.log(storage)
const upload =multer({
   
    storage,fileFilter:(req,file,cd)=>{
        const allowedTypes =[
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    
    if(allowedTypes.includes(file.mimetype)){
        cd(null,true);

    }else{
        cd(new Error("Only PDF/DOC/DOCX files allowed"))
    }
}
})

console.log("Upload Path:", uploadPath);
console.log("Exists:", fs.existsSync(uploadPath));

try {
  const testFile = path.join(uploadPath, "test.txt");
  fs.writeFileSync(testFile, "hello");
  console.log("✅ Test file created:", testFile);
} catch (err) {
  console.log("❌ Test file error:", err);
}
module.exports = upload;
