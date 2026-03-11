import express from "express"
import Razorpay from "razorpay"
import crypto from "crypto"

import {CONFIG} from "./config.js"

const router = express.Router()

const razorpay = new Razorpay({

key_id:CONFIG.RAZORPAY_KEY,
key_secret:CONFIG.RAZORPAY_SECRET

})

router.post("/create-order", async (req,res)=>{

const order = await razorpay.orders.create({

amount:req.body.amount,
currency:"INR"

})

res.json(order)

})

router.post("/verify", (req,res)=>{

const {order_id,payment_id,signature}=req.body

const body = order_id + "|" + payment_id

const expected = crypto
.createHmac("sha256",CONFIG.RAZORPAY_SECRET)
.update(body)
.digest("hex")

if(expected===signature){

res.json({status:"success"})

}else{

res.status(400).json({status:"failed"})

}

})

export default router