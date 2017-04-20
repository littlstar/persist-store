## s3-marker

`s3-marker` enables you to save marker files locally and on S3 so that you can process new files on a running basis. S3 back-ups allows you to save state reliably in case an instance fails.


## Install
```bash
npm install s3-marker --save
```

## Quick Example
```javascript
const S3Marker = require('s3-marker')

// example options
const marker = S3Marker({
  localDirectory: '../data',  // Required. The directory markers will save in locally.
  bucketName: 'data-markers'  // Required. The bucket the markers will save in.
})

marker.save('marker', '2017-04-04T12:00:00Z')
```

## Methods

### save
save(name, contents)

Saves a marker locally and on S3.
```javascript
marker.save('marker', '2017-04-04T12:00:00Z')
```

### load
forEach(name)

Attempts to load given marker locally, if the marker is not found, attempts to load marker from S3.
```javascript
marker
  .load('marker')
  .then((marker) => {
    console.log(`Here is the marker: ${marker}`)
  })
  .catch((error) => {
    console.error(`Something happened:`, { error: String(error.stack || error) })
  })
```
