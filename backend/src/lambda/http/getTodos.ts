import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { MetricPublisher } from '../../utils/metrics'

const logger = createLogger('TodosAccess')
const metricPublisher = new MetricPublisher()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    metricPublisher.requestsCountMetricPublish('getTodosRequest')
    const userId = getUserId(event)
    logger.info(`Get TODO items for user id: ${userId}`)
    logger.info(`Event content:\n${JSON.stringify(event)}`)

    const items = await getTodosForUser(userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
