import express from "express"
import cors from "cors"

import {CONFIG} from "./config.js"

import authRoutes from "./auth.js"
import aiRoutes from "./ai.js"
import paymentRoutes from "./payment.js"
import storageRoutes from "./storage.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth",authRoutes)
app.use("/ai",aiRoutes)
app.use("/payment",paymentRoutes)
app.use("/storage",storageRoutes)

app.get("/",(req,res)=>{

res.send("AI Image Converter API Running")

})

app.listen(CONFIG.PORT,()=>{

console.log("Server running on port "+CONFIG.PORT)

})