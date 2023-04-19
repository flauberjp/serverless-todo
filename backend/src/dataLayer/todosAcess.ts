import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllTodosItem(): Promise<TodoItem[]> {
    console.log("Getting all To-do's Item")
    console.log('todosTable', this.todosTable)

    const result = await this.docClient
      .scan({
        TableName: this.todosTable
      })
      .promise()
    const items = result.Items
    console.log("To-do's Item", JSON.stringify(items))
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

    console.log('Get TODO item: ', result.Item)
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
    console.log('userId', userId)
    console.log('result.userId', result.userId)
    return result.userId === userId
  }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    console.log(`Creating a To-do Item with id ${todoItem.id}`)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()

    console.info('To-do Item', todoItem)
    return todoItem
  }

  async updateTodoItem(
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
  ): Promise<TodoItem> {
    console.info(
      `Updating To-do Item with id ${todoId}. New field values: ${JSON.stringify(
        updateTodoRequest
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
          ':n': updateTodoRequest.name,
          ':d': updateTodoRequest.dueDate,
          ':r': updateTodoRequest.done
        }
      })
      .promise()

    console.info('To-do Item updated!')
    return this.getTodoItem(todoId)
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE === 'true') {
    console.log('Creating a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  console.log('Creating an AWS DynamoDB instance')
  return new XAWS.DynamoDB.DocumentClient()
}
