import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  createAttachmentPresignedUrl,
  updateTodoImgUrl
} from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { MetricPublisher } from '../../utils/metrics'

const logger = createLogger('TodosAccess')
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const metricPublisher = new MetricPublisher()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      metricPublisher.requestsCountMetricPublish('generateUploadUrlRequest')
      logger.info(`event ${JSON.stringify(event)}`)
      const todoId = event.pathParameters.todoId
      const userId = getUserId(event)
      const imageName = userId + '_' + todoId

      const url = await createAttachmentPresignedUrl(imageName)

      updateTodoImgUrl(
        userId,
        todoId,
        `https://${bucketName}.s3.amazonaws.com/${imageName}`
      )

      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: url
        })
      }
    } catch (e) {
      console.log('User was not authorized', e.message)
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: e.message
        })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
