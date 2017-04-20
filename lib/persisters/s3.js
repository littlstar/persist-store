'use strict'

const S3Lambda = require('s3-lambda')

class S3 {

  constructor(bucket, awsCreds) {
    if(!bucket) {
      throw new Error(`\`bucket\` is undefined for S3 persister`)
    }

    this.lambda = new S3Lambda({
      accessKeyId: awsCreds ? awsCreds.accessKeyId : undefined,
      secretAccessKey: awsCreds ? awsCreds.secretAccessKey : undefined
    })

    this.bucket = bucket
  }

  /**
   * Loads file from S3
   *
   * @param  {String} key    key of the file
   * @return {Promise}       Promise which resolves to file contents
   */

  load(key) {
    return this.lambda.get(this.bucket, key)
  }

  /**
   * Saves file to S3
   *
   * @param  {String} key    key of the file
   * @param  {String} value file contents
   * @return {Promise}
   */

  save(key, value) {
    return this.lambda.put(this.bucket, key, value)
  }
}

module.exports = S3