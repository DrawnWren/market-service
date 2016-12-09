process.env.AWS_PROFILE = 'btcs3';

const AWS = require('aws-sdk');

const region ='us-west-1';
const Bucket = 'btcpie';

AWS.config.update({
  region
});

const s3 = new AWS.S3();

function upload (Key, obj) {
  const params = {
    Bucket,
    Key,
    ACL: 'public-read',
    Body: JSON.stringify(obj),
    ContentType: 'application/json'
  };

 return new Promise((fulfill, reject) => {
   s3.putObject(params, (err, data) => {
    if (err) reject(err);
    else fulfill(data);
   });
 });
}

// returns a promise that represents the status of the S3 upload
module.exports = (results, pair, exchange) => {
  const time = new Date().getTime();
  const Key = `${exchange}/${pair}/${time}`;
  upload(Key, results)
  .then( () => console.log(`${exchange} Upload success, ${time}`) )
  .catch( err => console.log(`Upload error, ${err}`) );
}
