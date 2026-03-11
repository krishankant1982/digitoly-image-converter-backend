import express from "express"
import axios from "axios"
import FormData from "form-data"
import potrace from "potrace"

import {CONFIG} from "./config.js"

const router = express.Router()

router.post("/upscale", async (req,res)=>{

const {imageUrl,scale}=req.body

const response = await axios.post(

"https://api.replicate.com/v1/predictions",

{
version:"esrgan",
input:{
image:imageUrl,
scale:scale
}
},

{
headers:{
Authorization:"Token "+CONFIG.REPLICATE_KEY
}
}

)

res.json(response.data)

})

router.post("/remove-bg", async (req,res)=>{

const form = new FormData()

form.append("image_url",req.body.imageUrl)

const response = await axios.post(

"https://api.remove.bg/v1.0/removebg",
form,

{
headers:{
"X-Api-Key":CONFIG.REMOVE_BG_KEY
}
}

)

res.send(response.data)

})

router.post("/vectorize", async (req,res)=>{

potrace.trace(req.body.path,(err,svg)=>{

if(err){

return res.status(500).send(err)

}

res.send(svg)

})

})

export default router