import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  deleteTodo,
  todoItemBelongsToUser,
  todoItemExist
} from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`event: ${JSON.stringify(event)}`)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    if (await todoItemExist(userId, todoId)) {
      logger.info(`TODO item with id ${todoId} exist!`)
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
      logger.info(
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

    await deleteTodo(userId, todoId)

    logger.info(`Deleted item: ${todoId}`)

    return {
      statusCode: 200,
      body: ''
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
