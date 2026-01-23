import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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
  const restUser = event?.requestContext?.authorizer?.principalId;
  if (restUser) return restUser;

  const jwtClaims =
    event?.requestContext?.authorizer?.jwt?.claims?.sub ||
    event?.requestContext?.authorizer?.claims?.sub;
  return jwtClaims || null;
}

export const handler = async (event) => {
  try {
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

    const payload = JSON.parse(event.body || "{}");
    if (!payload.name || !payload.dueDate) {
      return {
        statusCode: 400,
        headers: getCorsHeaders(),
        body: JSON.stringify({ error: "name and dueDate are required" })
      };
    }

    const todoItem = {
      userId,
      todoId: uuidv4(),
      createdAt: new Date().toISOString(),
      name: payload.name,
      dueDate: payload.dueDate,
      done: false,
      attachmentKey: null
    };

    await docClient.send(new PutCommand({ TableName: TODOS_TABLE, Item: todoItem }));

    return {
      statusCode: 201,
      headers: getCorsHeaders(),
      body: JSON.stringify(todoItem)
    };
  } catch (error) {
    console.error("Error creating todo:", error);
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({ error: error.message })
    };
  }
};
