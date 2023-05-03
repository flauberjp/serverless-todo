import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
logger.info(`todosCreatedAtIndex name: ${todosCreatedAtIndex}`)

export class TodosAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info(`Get TODO items for user id: ${userId}`)
    logger.info(`todosTable name: ${this.todosTable}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: todosCreatedAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()
    const items = result.Items
    logger.info("To-do's Item", JSON.stringify(items))
    return items as TodoItem[]
  }

  async getTodoItem(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()

    logger.info('Get TODO item: ', result.Item)
    return result.Item
  }

  async todoItemExist(userId: string, todoId: string): Promise<boolean> {
    const result = await this.getTodoItem(userId, todoId)
    return !!result
  }

  async todoItemBelongsToUser(
    todoId: string,
    userId: string
  ): Promise<boolean> {
    const result = await this.getTodoItem(userId, todoId)
    return result.userId === userId
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    logger.info(`Creating a To-do Item with id ${todoItem.todoId}`)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()

    logger.info('To-do Item', todoItem)
    return todoItem
  }

  async updateTodoImgUrl(
    userId: string,
    todoId: string,
    attachmentUrl: string
  ): Promise<TodoItem> {
    logger.info(
      `Updating To-do Item with id ${todoId}. New field value: attachmentUrl=${attachmentUrl}`
    )

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set attachmentUrl = :a',
        ExpressionAttributeValues: {
          ':a': attachmentUrl
        }
      })
      .promise()

    logger.info('To-do Item updated!')
    return this.getTodoItem(userId, todoId)
  }

  async updateTodoItem(
    userId: string,
    todoId: string,
    todoUpdate: TodoUpdate
  ): Promise<TodoItem> {
    logger.info(
      `Updating To-do Item with id ${todoId}. New field values: ${JSON.stringify(
        todoUpdate
      )}`
    )

    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set #todoName = :n, duedate = :d, done = :r',
        ExpressionAttributeNames: {
          '#todoName': 'name'
        },
        ExpressionAttributeValues: {
          ':n': todoUpdate.name,
          ':d': todoUpdate.dueDate,
          ':r': todoUpdate.done
        }
      })
      .promise()

    logger.info('To-do Item updated!')
    return this.getTodoItem(userId, todoId)
  }

  async deleteTodoItem(userId: string, todoId: string): Promise<void> {
    logger.info(`Deleting To-do Item with id ${todoId}`)

    var params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    logger.info(`delete params: ${JSON.stringify(params)}`)

    await this.docClient.delete(params).promise()

    logger.info('To-do Item deleted!')
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE === 'true') {
    logger.info('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  logger.info('Creating an AWS DynamoDB instance')
  return new XAWS.DynamoDB.DocumentClient()
}
