'use strict'

const S3Lambda = require('s3-lambda')

const lambda = new S3Lambda({
  verbose: true
})

let bucket, prefix

class S3 {
  /**
   * Loads file from S3
   *
   * @param  {String} key    key of the file
   * @return {Promise}       Promise which resolves to file contents
   */

  static load(key) {
    console.info('loaded file from s3', {
      key: key
    })

    return lambda.get(bucket, key)
  }

  /**
   * Saves file to S3
   *
   * @param  {String} key    key of the file
   * @param  {String} value file contents
   * @return {Promise}
   */

  static save(key, value) {
    console.log("BUCKET:", bucket)
    console.info('file saved to s3', {
      key: key,
      value: value
    })

    return lambda.put(bucket, key, value)
  }
}

module.exports = (opts) => {
  bucket = opts.bucket
  prefix = opts.prefix

  return S3
}