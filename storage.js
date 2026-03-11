import express from "express"
import {createClient} from "@supabase/supabase-js"
import {CONFIG} from "./config.js"

const router = express.Router()

const supabase = createClient(
CONFIG.SUPABASE_URL,
CONFIG.SUPABASE_KEY
)

router.post("/upload", async (req,res)=>{

const {filePath,fileData}=req.body

const {data,error}=await supabase.storage
.from("images")
.upload(filePath,fileData)

if(error){

return res.status(400).json(error)

}

res.json(data)

})

router.get("/share/:file",(req,res)=>{

const url = supabase.storage
.from("images")
.getPublicUrl(req.params.file)

res.json(url)

})

export default router