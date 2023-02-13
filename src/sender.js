import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const exchange = 'account';
const text = {
  name: 'Caldas',
  age: 20, 
  state: 'Brazil'
};

(async () => {
  let connection;
  try {
    connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, '', Buffer.from(JSON.stringify(text)));
    console.log(text);
    await channel.close();
  }
  catch (err) {
    console.warn(err);
  }
  finally {
    if (connection) await connection.close();
  };
})();  