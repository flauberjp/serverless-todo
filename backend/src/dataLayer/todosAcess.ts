import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodosItem(): Promise<TodoItem[]> {
    logger.info("Getting all To-do's Item")
    logger.info('todosTable', this.todosTable)

    const result = await this.docClient
      .scan({
        TableName: this.todosTable
      })
      .promise()
    const items = result.Items
    logger.info("To-do's Item", JSON.stringify(items))
    return items as TodoItem[]
  }

  async getTodoItem(todoId: string): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          id: todoId
        }
      })
      .promise()

    logger.info('Get TODO item: ', result.Item)
    return result.Item
  }

  async todoItemExist(todoId: string): Promise<boolean> {
    const result = await this.getTodoItem(todoId)
    return !!result
  }

  async todoItemBelongsToUser(
    todoId: string,
    userId: string
  ): Promise<boolean> {
    const result = await this.getTodoItem(todoId)
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

  async updateTodoItem(
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
          id: todoId
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

    console.info('To-do Item updated!')
    return this.getTodoItem(todoId)
  }

  async deleteTodoItem(todoId: string): Promise<void> {
    logger.info(`Deleting To-do Item with id ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          id: todoId
        }
      })
      .promise()

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
