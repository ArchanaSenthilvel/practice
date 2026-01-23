import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX;
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
  if (!userId) {
    return {
      statusCode: 401,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }

  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TODOS_TABLE,
        IndexName: TODOS_CREATED_AT_INDEX,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
          ":uid": userId
        },
        ScanIndexForward: false
      })
    );

    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({ items: result.Items || [] })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }
};
