import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const exchange = 'account';

(async () => {
  try {
    const connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    const channel = await connection.createChannel();

    process.once('SIGINT', async () => { 
      await channel.close();
      await connection.close();
    });

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, '')

    await channel.consume(queue, (message) => {
      const msg = message.content.toString()
      if (message) console.log( JSON.parse(msg));
      else console.warn(' [x] Consumer cancelled');
    }, { noAck: true });

    console.log(' [*] Waiting for logs. To exit press CTRL+C');
  } catch (err) {
    console.warn(err);
  }
})();