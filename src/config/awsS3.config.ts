// src/config/awsS3.config.ts

import AWS from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.POST_IMAGES_BUCKET; // Bucket name from environment variable

/**
 * Uploads an image to the S3 bucket.
 * @param key - The file name or path within the bucket.
 * @param fileContent - The file content as a Buffer.
 * @returns - Promise with upload response data.
 */
export async function uploadImageToS3(key: string, fileContent: Buffer,mimetype:string) {
  const params: PutObjectRequest = {
    Bucket: BUCKET_NAME!,
    Key: key,
    Body: fileContent,
    ContentType: mimetype,
  };

  return s3.upload(params).promise();
}

export default s3;
