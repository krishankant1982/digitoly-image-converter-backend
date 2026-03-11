import dotenv from "dotenv"

dotenv.config()

export const CONFIG = {

PORT:3000,

SUPABASE_URL:process.env.SUPABASE_URL,
SUPABASE_KEY:process.env.SUPABASE_KEY,

RAZORPAY_KEY:process.env.RAZORPAY_KEY,
RAZORPAY_SECRET:process.env.RAZORPAY_SECRET,

REPLICATE_KEY:process.env.REPLICATE_KEY,
REMOVE_BG_KEY:process.env.REMOVE_BG_KEY

}