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
    const userCollection = database.collection("users")
    app.post('/news', async (req, res) => {
      const news = req.body
      const result = await newsCollection.insertOne(news)
      res.send(result)
    }
    )

    app.get('/news/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const news = await newsCollection.findOne(query)
      res.send(news)
    })

    app.get('/allNews', async (req, res) => {
      const skipPages = parseInt(req.query.skipPages)
      const perPageData = parseInt(req.query.perPageData)
      const result = await newsCollection.find().skip(skipPages * perPageData).limit(perPageData).toArray();
      res.send(result);
    })
    app.get('/allCounts', async (req, res) => {
      const totalNews = await newsCollection.estimatedDocumentCount();
      const totalUser = await userCollection.estimatedDocumentCount();

      // Limit totalNews count to 1600 if it exceeds
      const limitedTotalNews = Math.min(totalNews, 1600);

      res.send({
        totalNews: limitedTotalNews,
        totalUser: totalUser,
        
      });
    });


    app.get('/categoryNews', async (req, res) => {
      const skipPages = parseInt(req.query.skipPages);
      const category = req.query.category;
      const perPageData = parseInt(req.query.perPageData);
      const query = { category: category };
  
      // Get the total count of news articles in the specified category
      const totalCount = await newsCollection.countDocuments(query);
  
      // Calculate the total number of pages needed
      let totalPages = Math.ceil(totalCount / perPageData);
  
      // Limit totalPages to a maximum of 1600
      totalPages = Math.min(totalPages, 1600);
  
      // Fetch news articles based on pagination parameters
      const result = await newsCollection.find(query)
          .skip(skipPages * perPageData)
          .limit(perPageData)
          .toArray();
  
      // Send the result along with total pages information
      res.send({ news: result, totalPages: totalPages });
  });
  
  
    app.get('/searchedNews', async (req, res) => {
      try {
        const searchedText = req.query.searchedText;
        const query = { title: { $regex: searchedText, $options: 'i' } };
        const result = await newsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.patch('/news/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedNews = {
        $set: {
          title: req.body.title,
          description: req.body.description,
          category: req.body.category,
          image: req.body.image,
          news: req.body.news
        }
      }
      const result = await newsCollection.updateOne(filter, updatedNews, options);
      res.send(result)
    })
    app.delete('/news/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await newsCollection.deleteOne(query)
      res.send(result)
    })


    // for users
    app.post('/user', async (req, res) => {
      const user = req.body
      const query = { email: req.body.email }
      const isExisted = await userCollection?.findOne(query)
      if (isExisted) {
        return (
          res.send("already included as an user")
        )
      }
      const result = await userCollection.insertOne(user)
      res.send(result)
    }
    )
    app.get('/user/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const user = await newsCollection.findOne(user)
      res.send(user)
    })
    app.get('/users', async (req, res) => {
      const skipPages = parseInt(req.query.skipPages)
      const perPageData = parseInt(req.query.perPageData)
      const result = await userCollection.find().skip(skipPages * perPageData).limit(perPageData).toArray();
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

