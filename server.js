import express from "express"
import cors from "cors"
import multer from "multer"
import sharp from "sharp"
import Razorpay from "razorpay"
import crypto from "crypto"
import fs from "fs"
import path from "path"

const app = express()

app.use(cors({
 origin:["https://digitoly.com","http://localhost:3000"]
}))

app.use(express.json())

/* storage */
const upload = multer({ dest: "uploads/" })

/* ensure folders exist */
if(!fs.existsSync("uploads")) fs.mkdirSync("uploads")
if(!fs.existsSync("converted")) fs.mkdirSync("converted")

/* Razorpay setup */
const razorpay = new Razorpay({
 key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
 key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret"
})

/* health route */
app.get("/", (req,res)=>{
 res.send("Digitoly API running")
})

/* upload and convert */
app.post("/convert", upload.single("image"), async (req,res)=>{

 try{

  const file=req.file
  const format=req.body.format || "jpeg"
  const width=req.body.width ? parseInt(req.body.width) : null
  const height=req.body.height ? parseInt(req.body.height) : null

  const outputName=Date.now()+"."+format
  const outputPath="converted/"+outputName

  let img=sharp(file.path)

  if(width || height){
   img=img.resize(width,height)
  }

  await img.toFormat(format).toFile(outputPath)

  fs.unlinkSync(file.path)

  res.json({
   success:true,
   url:"/download/"+outputName
  })

 }catch(err){
  console.error(err)
  res.status(500).json({error:"conversion failed"})
 }

})

/* download converted file */
app.get("/download/:file",(req,res)=>{

 const file=req.params.file
 const filePath=path.join("converted",file)

 if(!fs.existsSync(filePath)){
  return res.status(404).send("File not found")
 }

 res.download(filePath)

})

/* create razorpay order */
app.post("/create-order", async (req,res)=>{

 const {amount}=req.body

 try{

  const order=await razorpay.orders.create({
   amount:amount*100,
   currency:"INR"
  })

  res.json(order)

 }catch(err){
  res.status(500).json({error:"payment error"})
 }

})

/* verify payment */
app.post("/verify-payment",(req,res)=>{

 const {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
 }=req.body

 const sign=razorpay_order_id+"|"+razorpay_payment_id

 const expected=crypto
  .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
  .update(sign)
  .digest("hex")

 if(expected===razorpay_signature){
  res.json({success:true})
 }else{
  res.status(400).json({success:false})
 }

})

/* start server */
const PORT=process.env.PORT || 3000

app.listen(PORT,()=>{
 console.log("Server running on port "+PORT)
})
