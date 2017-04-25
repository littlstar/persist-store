'use strict'

const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

/**
 * @class Logic for local persistence
 */

class File {
  constructor (opts) {
    if (!opts.path) {
      throw new Error('`path` is undefined for local persister')
    }

    const directory = path.resolve(__dirname, opts.path)
    mkdirp(directory)

    this.directory = directory
  }

  /**
   * Gets the file path for the given name
   *
   * @param {String} name Name of the name
   */

  getPath (name) {
    return `${this.directory}/${name}`
  }

  /**
   * Return the name. Creates empty file and returns empty string
   * if it does not already exist
   *
   * @param {String} name file name
   * @return {Promise} Promise which resolves in the value
   */

  load (name) {
    const dir = this.getPath(name)

    return new Promise((resolve, reject) => {
      if (fs.existsSync(dir)) {
        fs.readFile(dir, (err, file) => {
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

  save (name, value) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.getPath(name), value, (err) => {
        if (err) {
          reject(err)
        }

        return resolve()
      })
    })
  }
}

module.exports = File
