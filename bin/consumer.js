var bunyan = require('bunyan');
var config = require('../conf/config');
var kafka = require('node-rdkafka');
var Promise = require('bluebird');

var Writable = require('stream').Writable;

var logger = bunyan.createLogger({ name: 'noop-consumer', level: config.get('logLevel'), src: true, serializers: bunyan.stdSerializers });
logger.info({config: JSON.parse(config.toString())});

var broker = config.get('kafka.brokerHost') + ':' + config.get('kafka.brokerPort');

function doLog(log) {
  return new Promise(function (resolve, reject) {
    try {
      var json = JSON.parse(log);
      resolve(true);
    }
    catch (err) {
      reject(err); 
    }
  });
}

function handler(handlerFunction, consumerStream, logger) {
  return new Writable({
    objectMode: true,
    write: function (data, enc, next) {
      logger.debug({ kafkaPartition: data.partition, kafkaOffset: data.offset }, 'handler start');
      handlerFunction(data.value.toString())
        .then(function () {
          logger.debug({ kafkaPartition: data.partition, kafkaOffset: data.offset }, 'handler complete');
          consumerStream.consumer.commit(data);
          next();
        })
        .catch(function (err) {
          logger.debug({ eric: 'test', err: err.message }, 'FATAL handler function error');
          next(err);
        });
    }
  });
}

var consumerStream = new kafka.KafkaConsumer.createReadStream({
  'group.id': 'noop-consumer-group',
  'metadata.broker.list': broker,
  'socket.keepalive.enable': true,
  'enable.auto.commit': false
}, {
  'auto.offset.reset': 'earliest'
}, {
  topics: config.get('kafka.topic'),
  waitInterval: 0,
  objectMode: true
});

consumerStream.on('error', function(err) {
  if (err) logger.fatal({ err: err }, 'FATAL KAFKA STREAM ERROR');
  process.exit(1);
});

consumerStream.on('event.error', function(err) {
  logger.error({ err: err }, 'kafka stream error');
});

var handlerPipe = handler(doLog, consumerStream, logger);

handlerPipe.on('error', function(err) {
  if (err) logger.fatal({ err: err }, 'FATAL HANDLER STREAM ERROR');
  process.exit(1);
});

consumerStream.pipe(handlerPipe);
