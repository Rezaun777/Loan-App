import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_NAME || "dwjlf4i2m",
  api_key: process.env.CLOUDINARY_API_KEY || "245122134995835",
  api_secret: process.env.CLOUDINARY_API_SECRET || "lIjspAnibqBQy_T8NzqB4y4pa7Y",
})

export default cloudinary
