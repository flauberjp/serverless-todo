import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  todoItemBelongsToUser,
  todoItemExist,
  updateTodo
} from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('event', event)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    if (await todoItemExist(todoId)) {
      console.info(`TODO item with id ${todoId} exist!`)
    } else {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'TODO item does not exist'
        })
      }
    }

    if (await todoItemBelongsToUser(todoId, userId)) {
      console.info(
        `TODO item with id ${todoId} belongs to user which id is  ${userId} !`
      )
    } else {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'The user does not have a TODO item with that ID'
        })
      }
    }

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const newItem = await updateTodo(todoId, updatedTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({
        newItem
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
