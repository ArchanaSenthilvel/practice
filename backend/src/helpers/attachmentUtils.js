import AWS from 'aws-sdk'
import AWSXRay from 'aws-xray-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
export class AttachmentUtils {
  constructor(
    s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    bucketName = process.env.ATTACHMENT_S3_BUCKET,
    urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
  ) {
    this.s3 = s3
    this.bucketName = bucketName
    this.urlExpiration = urlExpiration
  }
  getAttachmentUrl(todoId) {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }
  getUploadUrl(todoId) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}
