import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const exchange = 'account';
const queue = 'account-queue';

(async () => {
  try {
    const connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    await channel.assertQueue(queue, { exclusive: true });
    await channel.bindQueue(queue, exchange, '')
    await channel.consume(queue, (message) => {
      const msg = message.content.toString()
      if (message) console.log( JSON.parse(msg));
    }, { noAck: true });

    console.log(' 🚀 🚀 [*] Waiting for logs 🚀 🚀 .');
  } catch (error) {
    throw new Error(error);
  }
})();