import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection;
let channel;

const queue = 'account-queue';
const exchange = 'account';
const dlxName = 'dlx-user';
const dlqName = 'dlq-user';
const dlqRouting = 'keyError';

(async () => {
  try {
    connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    channel = await connection.createChannel();
    await channel.assertExchange(dlxName, 'topic', { durable: true });
    await channel.assertQueue(dlqName, { durable: true });
    await channel.bindQueue(dlqName, dlxName, dlqRouting);
    await channel.assertExchange(exchange, 'topic', { durable: false });
    await channel.assertQueue(queue, {
      exclusive: true,
      deadLetterExchange: dlxName,
      deadLetterRoutingKey: dlqName
    });
    await channel.bindQueue(queue, exchange, 'productKey')
    await channel.consume(queue, (message) => {
      if (!message) {
        throw new Error('Message with value undefined.')
      }
      const msg = message.content.toString()
      const messageInJson = JSON.parse(msg);
      const newDate = new Date(messageInJson.birthdate)
      console.log();
      console.log(`Product\nName: ${messageInJson.name}\nPrice: ${messageInJson.price}\nQuantity: ${messageInJson.quantity}`);
    });
    console.log(' 🚀 🚀 [*] Waiting for logs 🚀 🚀 .');
  } catch (error) {
    throw new Error(error);
  }
})();
