import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "*";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const getCorsHeaders = () => ({
  "Access-Control-Allow-Origin": WEB_ORIGIN,
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
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

  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TODOS_TABLE,
        Key: { userId, todoId }
      })
    );

    return {
      statusCode: 204,
      headers: getCorsHeaders(),
      body: ""
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }
};
