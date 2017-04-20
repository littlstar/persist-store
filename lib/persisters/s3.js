'use strict'

const S3Lambda = require('s3-lambda')

const lambda = new S3Lambda()

let bucket

class S3 {
  /**
   * Loads file from S3
   *
   * @param  {String} key    key of the file
   * @return {Promise}       Promise which resolves to file contents
   */

  static load(key) {
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
    return lambda.put(bucket, key, value)
  }
}

module.exports = (opts) => {
  if(!opts || !opts.bucket) {
    throw new Error(`s3 persister must have \`bucket\``)
  }
  bucket = opts.bucket

  return S3
}