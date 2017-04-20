'use strict'

let save, load, context

/**
 * @class Logic for local persistence
 */

class Custom {

  /**
   * Return the file. Creates empty file and returns empty string
   * if it does not already exist
   *
   * @param {String} markerId Name of the file
   * @return {Promise} Promise which resolves in the value
   */

  static load(name) {
    return load(name, context)
  }

  /**
   * Update the value of the file
   *
   * @param {String} markerId Name of the file
   * @param {String} value The value of the new file
   */

  static save(name, value) {
    console.info('file saved', {
      name: name,
      value: newValue
    })

    return save(name, value, context)
  }

module.exports = (opts) => {
  save = opts.save
  load = opts.load
  context = opts.context

  return Custom
}