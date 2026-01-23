// import AWS from 'aws-sdk'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({})
const dynamoDb = DynamoDBDocumentClient.from(client)

import AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger.mjs'
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')
export class TodosAccess {
  constructor(
    docClient = new XAWS.DynamoDB.DocumentClient(),
    todosTable = process.env.TODOS_TABLE,
    todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {
    this.docClient = docClient
    this.todosTable = todosTable
    this.todosIndex = todosIndex
  }
  async getAllTodos(userId) {
    logger.info('Getting all todos for user', { userId })
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    return result.Items
  }
  async createTodo(todo) {
    logger.info('Creating new todo', { todoId: todo.todoId })
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    return todo
  }
  async updateTodo(userId, todoId, updatedTodo) {
    logger.info('Updating todo', { userId, todoId })
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        }
      })
      .promise()
  }
  async deleteTodo(userId, todoId) {
    logger.info('Deleting todo', { userId, todoId })
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        }
      })
      .promise()
  }
  async updateTodoAttachmentUrl(userId, todoId, attachmentUrl) {
    logger.info('Updating todo attachment URL', { userId, todoId })
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()
  }
}
