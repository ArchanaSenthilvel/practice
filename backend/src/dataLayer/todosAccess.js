import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos for user:', userId)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    console.log('Creating todo:', todo)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateTodo(
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate
  ): Promise<void> {
    console.log('Updating todo:', todoId, 'for user:', userId, 'with:', todoUpdate)

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
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    console.log('Deleting todo:', todoId, 'for user:', userId)

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

  async updateAttachmentUrl(
    todoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<void> {
    console.log('Updating attachment URL for todo:', todoId, 'URL:', attachmentUrl)

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