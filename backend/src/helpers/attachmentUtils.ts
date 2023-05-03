import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class AttachmentUtils {
  constructor(
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })
  ) {}

  async getUploadUrl(key: string): Promise<string> {
    const param = {
      Bucket: this.bucketName,
      Key: key,
      Expires: 60 * this.urlExpiration
    }

    const url = this.s3.getSignedUrl('putObject', param)

    return url
  }
}
