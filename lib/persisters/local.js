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
    this.defaultName = opts.path.split('/').slice(-1)[0]
  }

  /**
   * Return the stored value.
   *
   * @return {Promise} Promise which resolves in the value
   */

  async load(file) {
    // If `file` is not declared, load the default filename
    const loadPath = path.resolve(this.dir, file || this.defaultName)

    if (fs.existsSync(loadPath)) {
      try {
        const file = await readFile(loadPath)

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
    // If `value` is not declared, save the default filename
    const savePath = !value ? path.resolve(this.dir, this.defaultName) : path.resolve(this.dir, file)
    // If `value` is not declared, `file` is likely the value
    const saveValue = value || file

    const result = await writeFile(savePath, saveValue)

    return result
  }
}

module.exports = File
