'use strict'

const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

/**
 * @class Logic for local persistence
 */

class File {
  constructor(opts) {
    if (!opts.path) {
      throw new Error('`path` is undefined for local persister')
    }

    const directory = path.resolve(__dirname, opts.path.split('/').slice(0, -1).join('/'))
    mkdirp(directory)

    this.path = opts.path
  }

  /**
   * Return the stored value.
   *
   * @return {Promise} Promise which resolves in the value
   */

  load() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(this.path)) {
        fs.readFile(this.path, (err, file) => {
          if (err) {
            return reject(err)
          }

          return resolve(file.toString())
        })
      }
    })
  }

  /**
   * Update the value of the file
   *
   * @param {String} name Name of the file
   * @param {String} value The value of the new file
   */

  save(value) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, value, (err) => {
        if (err) {
          reject(err)
        }

        return resolve()
      })
    })
  }
}

module.exports = File
