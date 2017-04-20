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
    let file

    return new Promise((resolve, reject) => {
      if (fs.existsSync(dir)) {
        file = fs.readFileSync(dir).toString()
        console.info('loaded file', {
          name: name,
          value: file
        })
      }

      return resolve(file)
    })
  }

  /**
   * Update the value of the file
   *
   * @param {String} name Name of the file
   * @param {String} value The value of the new file
   */

  static save(name, value) {
    console.info('file saved', {
      name: name,
      value: value
    })

    fs.writeFileSync(this.getPath(name), value)
  }
}

module.exports = (opts) => {
  directory = path.resolve(__dirname, opts.dir)
  mkdirp(directory)

  return File
}