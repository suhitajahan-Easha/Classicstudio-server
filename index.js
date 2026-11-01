import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'
import upload from "./middleware/upload.js";
import uploadImage from "./utils/uploadImage.js";


const app=express();
const PORT= 5000;
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const mongoclient=await connectToMongoDB()
const db=mongoclient.db('Assignment8ph')
const studiocollection=db.collection('Studio')
const bookingcollection=db.collection('bookings')

// app.post('/add-studio', async (req,res)=>{

//   const data=req.body;
//   const result=await studiocollection.insertOne(data)
//   console.log(result)
//   res.send(result)
  
 
// })
app.post("/add-studio", upload.array("images", 5), async (req, res) => {
  try {
    const imageUrls = await Promise.all(
      req.files.map((file) => uploadImage(file))
    );

    const data = {
      ...req.body,
      amenities: JSON.parse(req.body.amenities || "[]"),
      images: imageUrls,
    };

    const result = await studiocollection.insertOne(data);

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to add studio" });
  }
});

app.get('/studio',async (req,res)=>{
  const result=await studiocollection.find().toArray()
  res.send(result)

})
app.get('/studio/:id', async (req,res)=>{
  const {id}=req.params
  const result =await studiocollection.findOne(
    {_id: new ObjectId(id)}
  )
  console.log("Requested ID:", id);
  console.log("Found studio:", result);
  res.send(result)
})
// app.patch('/studio/:id', async (req, res) => {
//   const data =req.body;
//   const {id}=req.params;
//   const result =await studiocollection.updateOne(
//     {_id: new ObjectId(id)},
//     {$set:data}
//   )
//   res.send(result);
 
// });
app.patch("/studio/:id", upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    let imageUrls;

    if (req.files && req.files.length > 0) {
      imageUrls = await Promise.all(
        req.files.map((file) => uploadImage(file))
      );
    } else {
      const oldStudio = await studiocollection.findOne({
        _id: new ObjectId(id),
      });

      imageUrls = oldStudio.images || [];
    }

    const updatedData = {
      ...data,
      amenities: JSON.parse(data.amenities || "[]"),
      images: imageUrls,
    };

    const result = await studiocollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to update studio" });
  }
});
 app.delete('/studio/:id', async (req, res) => {
  const {id}=req.params;
  const result =await studiocollection.deleteOne(
    {_id: new ObjectId(id)}
  )
  res.json(result)
});
app.post('/booking',async (req,res)=>{

  const data=req.body;
  const result=await bookingcollection.insertOne(data)
  console.log(result)
  res.send(result)
})
app.get('/booking/:email',async (req,res)=>{
  const {email}=req.params
  const result=await bookingcollection.find({bookingEmail:email}).toArray()
  res.send(result)

})
app.delete('/booking/:id',async(req,res)=>{
  const {id}=req.params
  const result=await bookingcollection.deleteOne({_id:id})
  res.send(result)
})
//for listing page
app.get('/add-studio/:email',async (req,res)=>{
  const {email}=req.params
  const result=await studiocollection.find({email:email}).toArray()
  res.send(result)

})
app.get('/',(req,res)=>{
  res.send('serving.....')
})

app.listen(PORT,()=>{
    console.log(`server is running at ${PORT}`)
})