const express = require("express")
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(cors())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hxdwxas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const database = client.db("twistBuzzDB")
    const newsCollection = database.collection("news")
    app.post('/news' , async(req, res) => {
      const news = req.body
      const result = await newsCollection.insertOne(news)
      res.send(result)
    }
    )
    app.get('/news/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const news = await newsCollection.findOne(query)
      res.send(news)
    })
    app.get('/allNews', async(req, res) => {
      const skipPages = parseInt(req.query.skipPages)
      const perPageData = parseInt(req.query.pageData)
      console.log(skipPages , perPageData)
      const result = await newsCollection.find().skip(skipPages*perPageData).limit(perPageData).toArray();
      res.send(result);
    })
  
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Twist buzz is running")
})
app.listen(port, () => {
    console.log(`The app is running on port ${port}`)
})

