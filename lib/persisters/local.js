'use strict'

const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

let directory

/**
 * @class Logic for local persistence
 */

class File {

  /**
   * Gets the file path for the given name
   *
   * @param {String} name Name of the name
   */

  static getPath(name) {
    return `${directory}/${name}`
  }

  /**
   * Return the name. Creates empty file and returns empty string
   * if it does not already exist
   *
   * @param {String} name file name
   * @return {Promise} Promise which resolves in the value
   */

  static load(name) {
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

  static save(name, value) {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.getPath(name), value, (err, result) => {
        if (err) {
          reject(err)
        }

        return resolve()
      })
    })
  }
}

module.exports = (opts) => {
  if(!opts || !opts.dir) {
    throw new Error(`local persister must have \`dir\``)
  }

  directory = path.resolve(__dirname, opts.dir)
  mkdirp(directory)

  return File
}