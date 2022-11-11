const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) =>{
 const authHeader = req.headers.authorization;
 if(!authHeader){
  res.status(401).send({message: 'unauthorized access'})
 }
 const token = authHeader.split(' ')[1];

 jwt.verify(token , process.env.ACCESS_TOKEN_SECRET, function(err , decoded){
  if(err){
    res.status(403).send({message: 'Forbidden access'})
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

// jwt token
app.post('/jwt', (req, res) =>{
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h'})
  res.send({token})
  console.log(user);
}) 


  app.get('/services', async (req, res) => {
    const query = {}
    const cursor = serviceCollection.find(query).limit(3);
    const services = await cursor.toArray();
    res.send(services);

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id:ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
    });
});

     //booking api 

    app.get('/bookings', verifyJWT, async(req , res)=>{
      
      const decoded = req.decoded;
      console.log('inside booking api', decoded);
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

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})