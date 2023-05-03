import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'
const logger = createLogger('TodosAccess')

var cloudwatch = new AWS.CloudWatch()

export class MetricPublisher {
  protected environment: string

  constructor() {
    this.environment = process.env.NODE_ENV
  }

  public async requestsCountMetricPublish(
    typeOfTodoRequest?: string,
    count?: number
  ): Promise<void> {
    try {
      logger.debug('publishing metric')

      await cloudwatch
        .putMetricData({
          MetricData: [
            {
              MetricName: typeOfTodoRequest
                ? typeOfTodoRequest
                : 'RequestsCount',
              Dimensions: [
                {
                  Name: 'Environment',
                  Value: this.environment
                }
              ],
              Unit: 'Count',
              Timestamp: new Date(),
              Value: count ? count : 1
            }
          ],
          Namespace: 'Udacity/Serveless'
        })
        .promise()
      logger.debug('successfully published metric')
    } catch (err) {
      logger.warn('Failed to publish metric ', err)
      return
    }
  }

  public async authorizationsCountMetricPublish(count?: number): Promise<void> {
    try {
      logger.debug('publishing metric')

      await cloudwatch
        .putMetricData({
          MetricData: [
            {
              MetricName: 'authorizationRequest',
              Dimensions: [
                {
                  Name: 'Environment',
                  Value: this.environment
                }
              ],
              Unit: 'Count',
              Timestamp: new Date(),
              Value: count ? count : 1
            }
          ],
          Namespace: 'Udacity/Serveless'
        })
        .promise()
      logger.debug('successfully published metric')
    } catch (err) {
      logger.warn('Failed to publish metric ', err)
      return
    }
  }
}
