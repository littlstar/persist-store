persist-store
=============

`persist-store` enables you to persist files across data stores (locally, S3, custom data store).

## Install

```bash
npm install persist-store --save
```

## Quick Example

```javascript
const Persist = require('persist-store')

// Under the hood, persist-store uses Promises, so
// custom persisters should implement promises

class LogIt {
  save(name, value) {
    return Promise.resolve('this does nothing')
  }
  load(name) {
    return Promise.resolve("shh, act like i loaded something:" + name)
  }
}

// example options
const persist = new Persist([
    {
      type: 'local',
      path: './data'
    },
    {
      type: 's3',
      bucket: 'a_bucket',
      accessKeyId: '1234',
      secretAccessKey: '4567'
    },
    {
      type: 'custom',
      implementation: new LogIt()
    }
])

persist.save('file', '2017-04-04T12:00:00Z')
```

If no services are given, only a local persister is created and files are saved in $HOME/.persist

## Methods

### save
save(name, contents)

Saves a file across all stores
```javascript
persist.save('file', '2017-04-04T12:00:00Z')
```

### load
load(name)

Checks all data stores for the file, makes sure they are all equal, then returns the value
```javascript
persist
  .load('file')
  .then((file) => {
    console.log(`Here is the file: ${file}`)
  })
  .catch((error) => {
    console.error(`Something happened:`, { error: String(error.stack || error) })
  })
```

## Testing

If you want to mock the S3 persist-store in a test, you can pass `localPath` along with `bucket` and S3 will use `${localPath}/${bucket}` as a mock S3 bucket

## License

MIT
