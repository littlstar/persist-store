'use strict'

const S3Lambda = require('s3-lambda')

class S3 {
  constructor(opts) {
    if (!opts.bucket) {
      throw new Error('`bucket` is undefined for S3 persister')
    }

    this.lambda = new S3Lambda({
      accessKeyId: opts.accessKeyId,
      secretAccessKey: opts.secretAccessKey,
      localPath: opts.localPath  // Only used for testing.
    })

    this.fullPath = `${opts.bucket}${opts.prefix ? `/${opts.prefix}` : ''}`

    this.key = opts.key
  }

  /**
   * Loads file from S3
   *
   * @return {Promise}       Promise which resolves to file contents
   */

  load() {
    return this.lambda.get(this.fullPath, this.key)
  }

  /**
   * Saves file to S3
   *
   * @param  {String} value file contents
   * @return {Promise}
   */

  save(value) {
    return this.lambda.put(this.fullPath, this.key, value)
  }
}

module.exports = S3
