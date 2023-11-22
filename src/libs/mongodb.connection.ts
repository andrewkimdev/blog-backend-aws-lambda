import { MongoClient, ServerApiVersion} from 'mongodb';
const username = process.env.ATLAS_USERNAME;
const password = process.env.ATLAS_PASSWORD;
const uri = `mongodb+srv://${username}:${password}@atlascluster.p3uec1y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
export const mongodbHandler = async () => {
  const databases = await client.db('admin').command({ listDatabases: 1 });
  return {
    statusCode: 200,
    databases: databases
  };
}
