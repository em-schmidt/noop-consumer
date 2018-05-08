var convict = require('convict');

var config = convict({
  kafka: {
    brokerHost: {
      doc: 'kafka broker service host',
      format: 'String',
      default: 'kafka-kafka',
      env: 'KAFKA_KAFKA_SERVICE_HOST'
    },
    brokerPort: {
      doc: 'kafka broker service port',
      format: 'port',
      default: '9092',
      env: 'KAFKA_KAFKA_SERVICE_PORT'
    },
    topic: {
      doc: 'kafka topic to conumer from',
      format: 'String',
      default: 'testTopic',
      env: 'KAFKA_TOPIC'
    }
  },
  logLevel: {
    doc: 'bunyan logger logging level [fatal, error, warn, info, debug, trace]',
    format: 'String',
    default: 'debug',
    env: 'LOG_LEVEL'
  }
});

config.validate({allowed: 'strict'});

module.exports = config;
