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


const run = async()=>{

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ijfbjuv.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

try{
  const serviceCollection = client.db("serviceReview").collection("services");
  const bookingCollection = client.db('serviceReview').collection('booking');

//jwt token
app.post('/jwt', (req, res) =>{
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d'})
  res.send({token})
}) 


  app.get('/services', async (req, res) => {
    const query = {}
    const cursor = serviceCollection.find(query);
    const services = await cursor.toArray();
    res.send(services);

    app.get('/services/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id:ObjectId(id)};
        const service = await serviceCollection.findOne(query);
        res.send(service);
    });
});

     //booking
     app.post('/booking', async(req , res)=>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);

     })

    }
    finally{

    }

}
run()
// .catch(err => console.error(err));

app.get('/', (req, res) => {
  res.send('Hello World!!!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})