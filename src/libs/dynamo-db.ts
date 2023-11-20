import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Define your local and AWS configurations
const localDynamoConfig = {
  endpoint: "http://localhost:8000", // URL for local DynamoDB
  region: "local-env", // Specify a dummy region for local
  credentials: {
    accessKeyId: "fakeMyKeyId", // Dummy access key
    secretAccessKey: "fakeSecretAccessKey" // Dummy secret key
  }
};

const awsDynamoConfig = {
  // AWS configuration (can be left empty to use default credentials and region)
};

// Choose the configuration based on the environment
const isLocal = process.env.IS_LOCAL === 'true'; // Set this environment variable in your local environment
// const config = isLocal ? localDynamoConfig : awsDynamoConfig;
const config = localDynamoConfig
// console.log(`isLocal: ${isLocal}`)
// Create DynamoDB client with the selected configuration
const client = new DynamoDBClient(config);
export const dynamo = DynamoDBDocumentClient.from(client);
