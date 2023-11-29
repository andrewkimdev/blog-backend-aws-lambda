// import { MongoClient, ServerApiVersion} from 'mongodb';
// const username = process.env.ATLAS_USERNAME ?? 'blogUser';
// const password = process.env.ATLAS_PASSWORD ?? 'orange2VOYAGE_truism';
// const uri = `mongodb+srv://${username}:${password}@atlascluster.p3uec1y.mongodb.net/?retryWrites=true&w=majority`;
//
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// export const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
//
// export const blogDb = client.db('blog');
// export const postsCollection = blogDb.collection<unknown>('movies');
