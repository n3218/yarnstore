import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';
dotenv.config();

// const storage = new Storage({
//   projectId: process.env.GCLOUD_PROJECT,
//   credentials: {
//     client_email: process.env.GCLOUD_CLIENT_EMAIL,
//     private_key: process.env.GCLOUD_PRIVATE_KEY
//   }
// })
const storage = new Storage();

const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

export default bucket;
