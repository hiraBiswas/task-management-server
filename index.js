const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
  
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://taskManager:yKDQrXz94AjpaXdc@cluster0.eogwfq1.mongodb.net/?retryWrites=true&w=majority";
// const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASS)}@cluster0.swu9d.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
     // Connect the client to the server	(optional starting in v4.7)
   

     const userCollection = client.db("taskManagement").collection("users");
     const toDoCollection = client.db("taskManagement").collection("toDo");
     const rentCollection = client.db("truckNow").collection("rent");
 

  // users related api
  app.get('/users', async (req, res) => {
    const result = await userCollection.find().toArray();
    res.send(result);
  });


  app.post('/users', async (req, res) => {
    const user = req.body;
    // insert email if user doesnt exists: 
    // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
    const query = { email: user.email }
    const existingUser = await userCollection.findOne(query);
    if (existingUser) {
      return res.send({ message: 'user already exists', insertedId: null })
    }
    const result = await userCollection.insertOne(user);
    res.send(result);
  });



  app.post('/toDo',  async (req, res) => {
    const item = req.body;
    const result = await toDoCollection.insertOne(item);
    res.send(result);
  });

    //for truck 
  app.get('/toDo', async (req, res) => {
    const result = await toDoCollection.find().toArray();
    res.send(result);
  });


  app.delete('/toDo/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const query = { _id: new ObjectId(taskId) };
  
      const result = await toDoCollection.deleteOne(query);
  
      if (result.deletedCount === 1) {
        res.json({ message: 'Task deleted successfully' });
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


     // Send a ping to confirm a successful connection
     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
  

  }
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Task manager is connecting')
})

app.listen(port, () => {
  console.log(`Task manager is sitting on port ${port}`);
})