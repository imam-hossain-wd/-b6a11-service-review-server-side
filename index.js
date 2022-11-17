const express = require('express');
var cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors())
app.use(express.json());


const verifyJWT = (req, res, next) =>{
 const authHeader = req.headers.authorization;
 if(!authHeader){
 return  res.status(401).send({message: 'unauthorized access'})
 }
 const token = authHeader.split(' ')[1];

 jwt.verify(token , process.env.ACCESS_TOKEN_SECRET, function(err , decoded){
  if(err){
  return res.status(403).send({message: 'Forbidden access'})
  }
  req.decoded = decoded;
  next()
 })
}

const run = async()=>{

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ijfbjuv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

try{
  const serviceCollection = client.db("serviceReview").collection("services");
  const bookingCollection = client.db('serviceReview').collection('booking');
  const userCollection = client.db('serviceReview').collection('users');

// jwt token
app.post('/jwt', (req, res) =>{
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h'})
  res.send({token})
  console.log(user);
}) 

//post user
app.post('/users' , async (req, res)=>{
  const user = req.body;
  const result = await userCollection.insertOne(user);
  res.send(result)
})



//get user

app.get('/users', async (req, res) => {
  
  let query = {};
  if(req.query.reviewId) {
    query= {
      reviewId: req.query.reviewId
    }
  }

  const cursor = userCollection.find(query);
  const user = await cursor.toArray();
  const reverseUser = user.reverse();
  res.send(reverseUser)
})

//update user

app.get('/users/:id' , async (req, res)=>{
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const user = await userCollection.findOne(query)
  res.send(user)
})

app.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: ObjectId(id) };
  const user = req.body;
  const option = {upsert: true};
  const updatedUser = {
      $set: {
          customer: user.name,
          message: user.message,
          email: user.email
      }
  }
  const result = await userCollection.updateOne(filter, updatedUser, option);
  console.log(result);
  res.send(result);
})


// delete user

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) }
  const result = await userCollection.deleteOne(query);
  console.log(result);
  res.send(result);

});


// add service post
app.post('/services' , async (req, res)=>{
  const AddService = req.body;
  const result = await serviceCollection.insertOne(AddService);
  res.send(result)
})


app.get('/service', async (req, res) => {
    const query = {}
    const cursor = serviceCollection.find(query).sort({insertTime: -1}).limit(3);
    const services = await cursor.toArray();
    res.send(services);
})


  app.get('/services', async (req, res) => {
    const query = {}
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);



    app.get('/service/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id:ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
    });
});

     //booking api 

    app.get('/bookings', verifyJWT, async(req , res)=>{
      
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
        res.status(403).send({message: 'unauthorized access'})
      }

      let query = {};
      if(req.query.email){
        query= {
          email: req.query.email 
        }
      }
      const cursor = bookingCollection.find(query);
      const bookings = await cursor.toArray();
      res.send(bookings)
    })

     app.post('/booking', async(req , res)=>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);

     })

     //update 
     app.patch('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.body.status
      const query = { _id: ObjectId(id) }
      const updatedDoc = {
          $set:{
              status: status
          }
      }
      const result = await bookingCollection.updateOne(query, updatedDoc);
      res.send(result);
  })


    // delete 
    delete
     app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
  })

    }
    finally{
    }
}
run()
.catch(err => console.error(err));

app.listen(port, () => {
  console.log(`Travel Zone listening on port ${port}`)
})