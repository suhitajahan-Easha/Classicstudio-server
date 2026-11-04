import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";
import cors from "cors";
import upload from "./middleware/upload.js";
import uploadImage from "./utils/uploadImage.js";
import { createRemoteJWKSet, jwtVerify } from "jose";

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

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

const mongoclient = await connectToMongoDB();
const db = mongoclient.db("Assignment8ph");
const studiocollection = db.collection("Studio");
const bookingcollection = db.collection("bookings");


const verifyjwttoken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }
  console.log(token);
  const JWKS = createRemoteJWKSet(
    new URL(`${process.env.CLIENT_URI}/api/auth/jwks`),
  );
  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
  } catch (error) {
    return res.status(500).send({ msg: "server error!" });
  }
  next();
};


app.post( "/add-studio",upload.array("images", 5),verifyjwttoken,async (req, res) => {
    try {
      const imageUrls = await Promise.all(
        req.files.map((file) => uploadImage(file)),
      );

      const data = {
        ...req.body,
        amenities: JSON.parse(req.body.amenities || "[]"),
        images: imageUrls,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        bookingStatus: "Available",
      };

      const result = await studiocollection.insertOne(data);

      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Failed to add studio" });
    }
  },
);

app.get("/studio", async (req, res) => {
  const result = await studiocollection.find().toArray();
  res.send(result);
});
app.get("/studio/:id", async (req, res) => {
  const { id } = req.params;
  const result = await studiocollection.findOne({ _id: new ObjectId(id) });
  console.log("Requested ID:", id);
  console.log("Found studio:", result);
  res.send(result);
});

app.patch("/studio/:id",upload.array("images", 5), verifyjwttoken,async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      let imageUrls;

      if (req.files && req.files.length > 0) {
        imageUrls = await Promise.all(
          req.files.map((file) => uploadImage(file)),
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
        { $set: updatedData },
      );

      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Failed to update studio" });
    }
  },
);
app.delete("/studio/:id", verifyjwttoken, async (req, res) => {
  const { id } = req.params;
  const result = await studiocollection.deleteOne({ _id: new ObjectId(id) });
  res.json(result);
});

//the last post one with availability
// app.post("/booking", verifyjwttoken, async (req, res) => {
  

//   try {
//      const {studioId, bookingDate, timeSlot } = req.body;

//     if (!studioId || !ObjectId.isValid(studioId) || !timeSlot) {
//       return res.status(400).send({
//         message: "Please select a valid booking time."
//       });
//     }
//     // const { bookingDate, startTime, endTime } = req.body;

//     // if (!studioId || !ObjectId.isValid(studioId) || !startTime || !endTime || startTime >= endTime) {
//     //   return res.status(400).send({ message: "Please select a valid booking time." });
//     // }

//     // const existingBooking = await bookingcollection.findOne({
//     //   studioId, bookingDate, status: "Confirmed",
//     //   startTime: { $lt: endTime },
//     //   endTime: { $gt: startTime },
//     // });

//     // if (existingBooking) {
//     //   return res.status(409).send({
//     //     message: "This time slot is already booked. Please choose another time.",
//     //   });
//     // }

//     const studioResult = await studiocollection.updateOne(
//       { _id: new ObjectId(studioId), bookingStatus: "Available" },
//       { $set: { bookingStatus: "Unavailable" } }
//     );

//     if (studioResult.matchedCount === 0) {
//       return res.status(409).send({ message: "This studio is already unavailable." });
//     }

//     const { bookingStatus, ...bookingData } = req.body;

//     const result = await bookingcollection.insertOne({
//       ...bookingData,
//       status: "Pending"
//     });

//     res.send(result);

//   } catch (error) {
//     console.log(error);

//     await studiocollection.updateOne(
//       { _id: new ObjectId(studioId), bookingStatus: "Unavailable" },
//       { $set: { bookingStatus: "Available" } }
//     );

//     res.status(500).send({ message: "Booking failed." });
//   }
// });

app.post("/booking", verifyjwttoken, async (req, res) => {
  try {
    const { studioId, bookingDate, timeSlot } = req.body;

    if (!studioId || !ObjectId.isValid(studioId) || !bookingDate || !timeSlot) {
      return res.status(400).send({
        message: "Please provide valid booking details."
      });
    }

    const existingBooking = await bookingcollection.findOne({
      studioId,
      bookingDate,
      timeSlot,
      status: "Confirmed"
    });

    if (existingBooking) {
      return res.status(409).send({
        message: "This time slot is already booked. Please choose another date or time slot."
      });
    }

    const { bookingStatus, ...bookingData } = req.body;

    const result = await bookingcollection.insertOne({
      ...bookingData,
      status: "Pending"
    });

    res.send(result);

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Booking failed."
    });
  }
});


app.get("/booking/:email", verifyjwttoken, async (req, res) => {
  const { email } = req.params;
  const result = await bookingcollection
    .find({ bookingEmail: email })
    .toArray();
  res.send(result);
});


//the last patch with availability
// app.patch("/booking/:id", verifyjwttoken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the pending booking
//     const booking = await bookingcollection.findOne({
//       _id: new ObjectId(id),
//       status: "Pending",
//     });

//     if (!booking) {
//       return res.status(400).send({
//         message: "Booking could not be cancelled.",
//       });
//     }

//     // Change booking status to Cancelled
//     const result = await bookingcollection.updateOne(
//       {
//         _id: new ObjectId(id),
//         status: "Pending",
//       },
//       {
//         $set: { status: "Cancelled" },
//       }
//     );

//     if (result.modifiedCount === 0) {
//       return res.status(400).send({
//         message: "Booking could not be cancelled.",
//       });
//     }

//     // Make the studio available again
//     await studiocollection.updateOne(
//       {
//         _id: new ObjectId(booking.studioId),
//       },
//       {
//         $set: { bookingStatus: "Available" },
//       }
//     );

//     res.send({ message: "Booking cancelled successfully." });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ message: "Cancellation failed." });
//   }
// });

app.patch("/booking/:id", verifyjwttoken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await bookingcollection.updateOne(
      { _id: new ObjectId(id), status: "Pending" },
      { $set: { status: "Cancelled" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).send({
        message: "Booking could not be cancelled."
      });
    }

    res.send({ message: "Booking cancelled successfully." });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Cancellation failed."
    });
  }
});

////previous 1st patch
// app.patch("/booking/:id", verifyjwttoken, async (req, res) => {
//   const { id } = req.params;
//   const booking = await bookingcollection.findOne({
//     _id: new ObjectId(id),
//     status: "Pending",
//   });

//   if (!booking) {
//     return res.status(400).send({
//       message: "Booking could not be cancelled.",
//     });
//   }

//   const result = await bookingcollection.updateOne(
//     { _id: new ObjectId(id), status: "Pending" },
//     { $set: { status: "Cancelled" } },
//   );

//   if (result.modifiedCount === 0) {
//     return res.status(400).send({
//       message: "Booking could not be cancelled.",
//     });
//   }

//   await studiocollection.updateOne(
//     { _id: new ObjectId(booking.studioId) },
//     { $set: { bookingStatus: "Available" } },
//   );

//   res.send({ message: "Booking cancelled successfully." });
// });

// app.delete('/booking/:id',async(req,res)=>{
//   const {id}=req.params
//   const result=await bookingcollection.deleteOne({_id:id})
//   res.send(result)
// })
//for listing page


app.get("/add-studio/:email", verifyjwttoken, async (req, res) => {
  const { email } = req.params;
  const result = await studiocollection.find({ email: email }).toArray();
  res.send(result);
});
app.get("/featured-Studio", async (req, res) => {
  const result = await studiocollection
    .find()
    .sort({ _id: -1 })
    .limit(6)
    .toArray();
  res.send(result);
});


///formanagingownstudiobooking as host
app.get("/mystudiobooking",verifyjwttoken, async (req, res) => {
  try {
    const hostEmail = req.query.email;

    const bookings = await bookingcollection.find({
      hostEmail: hostEmail,
    }).toArray();

    res.send(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to fetch bookings." });
  }
});
///confirming booking as host
app.patch("/booking/confirm/:id",verifyjwttoken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hostEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid booking ID." });
    }

    const result = await bookingcollection.updateOne(
      {
        _id: new ObjectId(id),
        hostEmail: hostEmail,
        status: "Pending",
      },
      {
        $set: { status: "Confirmed" },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({
        message: "Booking not found or already processed.",
      });
    }

    res.send({ message: "Booking confirmed successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to confirm booking." });
  }
});
//cancelling booking as host 
app.patch("/booking/cancel/:id",verifyjwttoken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hostEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid booking ID." });
    }

    const result = await bookingcollection.updateOne(
      {
        _id: new ObjectId(id),
        hostEmail: hostEmail,
        status: "Pending",
      },
      {
        $set: { status: "Cancelled" },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send({
        message: "Booking not found or already processed.",
      });
    }

    res.send({ message: "Booking cancelled successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Failed to cancel booking." });
  }
});
app.get("/", (req, res) => {
  res.send("serving.....");
});

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});

export default app;
