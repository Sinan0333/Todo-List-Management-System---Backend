import dotenv from "dotenv"
import connectDB from "./Config/mongoDb.js";
import app from "./app.js";


dotenv.config()
connectDB()
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})