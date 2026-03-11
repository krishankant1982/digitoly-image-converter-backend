import express from "express"
import jwt from "jsonwebtoken"
import {createClient} from "@supabase/supabase-js"
import {CONFIG} from "./config.js"

const router = express.Router()

const supabase = createClient(
CONFIG.SUPABASE_URL,
CONFIG.SUPABASE_KEY
)

router.post("/login", async (req,res)=>{

const {email,password}=req.body

const {data,error}=await supabase.auth.signInWithPassword({

email,
password

})

if(error){

return res.status(400).json(error)

}

const token = jwt.sign(

{user:data.user.id},
"secret",
{expiresIn:"7d"}

)

res.json({token})

})

export default router