import { MongoClient, type Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri =
    process.env.MONGODB_URI || "mongodb+srv://secret007:IhUq4QquSZlpEqR0@cluster0.v4dxro1.mongodb.net/?appName=Cluster0"

  if (!uri) {
    throw new Error("MONGODB_URI is not defined")
  }

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    })

    await client.connect()

    const db = client.db("loan_app")

    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${error}`)
  }
}