import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const BUCKET = process.env.ATTACHMENT_S3_BUCKET;
const TODOS_TABLE = process.env.TODOS_TABLE;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "*";

const s3 = new S3Client({});
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": WEB_ORIGIN,
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PATCH,DELETE"
});

function extractUserId(event) {
  return (
    event?.requestContext?.authorizer?.principalId ||
    event?.requestContext?.authorizer?.jwt?.claims?.sub ||
    event?.requestContext?.authorizer?.claims?.sub ||
    null
  );
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: getCorsHeaders(), body: "" };
  }

  const userId = extractUserId(event);
  const todoId = event.pathParameters?.todoId;

  if (!userId || !todoId) {
    return {
      statusCode: 400,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: "Invalid request" })
    };
  }

  const key = `${todoId}.png`;

  try {
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key
      }),
      { expiresIn: 300 }
    );

    await docClient.send(
      new UpdateCommand({
        TableName: TODOS_TABLE,
        Key: { userId, todoId },
        UpdateExpression: "set attachmentKey=:a",
        ExpressionAttributeValues: {
          ":a": key
        }
      })
    );

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({ uploadUrl })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }
};
