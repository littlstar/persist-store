'use strict'

const promisify = require('util.promisify')
const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

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

    this.dir = directory
  }

  /**
   * Return the stored value.
   *
   * @return {Promise} Promise which resolves in the value
   */

  async load(filePath) {
    if (fs.existsSync(path.resolve(this.dir, filePath))) {
      try {
        const file = await readFile(path.resolve(this.dir, filePath))

        return file.toString()
      } catch (e) {
        return e
      }
    } else {
      return ''
    }
  }

  /**
   * Update the value of the file
   *
   * @param {String} file Name of the file
   * @param {String} value The value of the new file
   */

  async save(file, value) {
    const result = await writeFile(path.resolve(this.dir, file), value)

    return result
  }
}

module.exports = File
