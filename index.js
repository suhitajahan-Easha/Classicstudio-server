import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'


const app=express();
const PORT= 5000;
// app.use(cors())
// app.use(express.json())

// const client = new MongoClient(process.env.MONGODB_URI);

// export async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("You successfully connected to MongoDB!");
//     return client;
//   } catch (err) {
//     console.dir(err);
//   }
// }

// // const mongoclient=await connectToMongoDB()
// const db=mongoclient.db('Assignment8ph')
// const destinationcollection=db.collection('destination')
// const bookingcollection=db.collection('bookings')


app.get('/',(req,res)=>{
  res.send('serving.....')
})

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})