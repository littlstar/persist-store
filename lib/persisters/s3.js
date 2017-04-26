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
    this.key = opts.key
  }

  /**
   * Loads file from S3
   *
   * @return {Promise}       Promise which resolves to file contents
   */

  load() {
    return new Promise((resolve, reject) => {
      this.lambda.get(this.bucket, this.key)
        .then(resolve)
        .catch((e) => {
          if (String(e).indexOf('NoSuchKey') > -1) {
            return resolve('')
          }
          return reject(e)

        })
    })
  }

  /**
   * Saves file to S3
   *
   * @param  {String} value file contents
   * @return {Promise}
   */

  save(value) {
    return this.lambda.put(this.bucket, this.key, value)
  }
}

module.exports = S3
