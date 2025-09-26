// we can run with the require statement also 
// require('dotenv').config({path : './env'})
//but we will learn another way 
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
    path : './env'
})
//inorder to just use import statement we have to do all this 
//and also we have to add this 
//-r dotenv/config --experimental-json-modules
//in scripts so whenever our app loads .env will be loaded 
//but we will get some errors while running npm run dev


connectDB()
.then(()=>{
    // app.on("error",(error)=>{
    //     console.log("ERRR: " , error)
    //     process.exit(1)
    // })
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    }) 
})
.catch((err)=>{
    console.log("MONGO db connection failed !!" , err)
})































// import expreess from "express"

// const app = expreess()
//this is one way of connecting db
// function connectDB(){

// }

// connectDB()

//here is another way of connecting db using iffe

// ;(async ()=>{

//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("Errr: ",error)
//             throw error
//         })
//         app.listen(process.env.PORT , ()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })

//     }catch(error){
//         console.error("Error : ",error)
//         throw error
//     }

// })()

//and we will use another approach in which we will write the whole connection
//in another file in db folder and export that function to index.js file 