const express = require("express")
const multer = require("multer")
const { exec } = require("child_process")
const fs = require("fs")
const path = require("path")

const app = express()

const upload = multer({ dest: "uploads/" })

app.use("/files", express.static("output"))

app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"index.html"))
})

function getFiles(dir, base="") {

let results = []
const list = fs.readdirSync(dir)

list.forEach(file => {

const full = path.join(dir,file)
const rel = path.join(base,file)

if(fs.statSync(full).isDirectory()){
results = results.concat(getFiles(full,rel))
}else{
results.push(rel)
}

})

return results
}

app.post("/upload", upload.single("jar"), (req,res)=>{

if(!req.file) return res.send("No file")

const jarPath = req.file.path
const outputDir = "output"

exec(`java -jar cfr-0.152.jar ${jarPath} --outputdir ${outputDir}`, (err)=>{

if(err){
console.log(err)
return res.send("Decompiler error")
}

const files = getFiles(outputDir)

res.json(files)

})

})

app.listen(process.env.PORT || 3000, ()=>{
console.log("Server running")
})
