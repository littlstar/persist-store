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

    this.bucket = opts.bucket
  }

  /**
   * Loads file from S3
   *
   * @return {Promise}       Promise which resolves to file contents
   */

  async load(key) {
    try {
      const file = await this.lambda.get(this.bucket, key)
      return file.trim()
    } catch (e) {
      if (String(e.name).indexOf('NoSuchKey') > -1) {
        return ''
      }
      return e
    }
  }

  /**
   * Saves file to S3
   *
   * @param  {String} value file contents
   * @return {Promise}
   */

  async save(key, value) {
    return this.lambda.put(this.bucket, key, value)
  }
}

module.exports = S3
