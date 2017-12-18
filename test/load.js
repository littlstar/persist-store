'use strict'

const mkdirp = require('mkdirp').sync
const rimraf = require('rimraf').sync
const Persist = require('../')
const test = require('tape')
const path = require('path')
const fs = require('fs')

const folderName = 'data'
const bucketName = 'bucket'
const localPath = path.resolve(__dirname, folderName)
const bucketPath = path.resolve(localPath, bucketName)

class CustomPersister {
  constructor(opts) {
    this.values = {}
    opts.initial.forEach((obj) => {
      this.values.file = String(obj.value)
    })
  }

  save(value) {
    this.values.file = value

    return Promise.resolve()
  }

  load() {
    return Promise.resolve(this.values.file)
  }
}

let persist

function reset(persisters, files) {
  rimraf(localPath)
  mkdirp(bucketPath)

  persist = new Persist(persisters)

  files.forEach((file) => {
    fs.writeFileSync(path.resolve(file.path), file.value)
  })
}

test('local load', (t) => {
  t.plan(1)

  reset([
    {
      type: 'local',
      path: `${localPath}/file`
    }
  ], [
    { path: `${localPath}/file`, value: '1234' }
  ])

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})

test('s3 load', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' }
  ])

  const file = await persist.load('file')

  t.equal(file, '1234')
})

test('s3 + local load', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    },
    {
      type: 'local',
      path: `${localPath}/file`
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '1234' }
  ])

  const file = await persist.load('file')

  t.equal(file, '1234')
})

test('s3 + local load w/o name specified', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    },
    {
      type: 'local',
      path: `${localPath}/file`
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '1234' }
  ])

  const file = await persist.load()

  t.equal(file, '1234')
})


test('s3 + local + custom load', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    },
    {
      type: 'local',
      path: `${localPath}/file`
    },
    {
      type: 'custom',
      implementation: new CustomPersister({
        initial: [
          { name: 'file', value: '1234' }
        ]
      })
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '1234' }
  ])

  const file = await persist.load('file')

  t.equal(file, '1234')
})

test('differing values load', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    },
    {
      type: 'local',
      path: `${localPath}/file`
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '4567' }
  ])

  try {
    await persist.load('file')

    t.fail('Differing contents loaded successfully!')
  } catch (e) {
    t.ok(!!e)
  }
})

test('only return non-empty value', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    },
    {
      type: 'local',
      path: `${localPath}/file`
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '' }
  ])

  const file = await persist.load('file')

  t.equal(file, '1234')
})

// Caused by editing the file manually
test('strips newline character', async (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath,
      bucket: bucketName,
      key: 'file'
    },
    {
      type: 'local',
      path: `${localPath}/file`
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234\n' },
    { path: `${localPath}/file`, value: '1234' }
  ])

  const file = await persist.load('file')

  t.equal(file, '1234')
})
