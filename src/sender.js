import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection;
let channel;

const queue = 'account-queue';
const exchange = 'account';
const text = {
  name: 'Caldas',
  age: 20, 
  state: 'Brazil',
  birthdate: new Date()
};

(async () => {

  try {
    connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, queue, Buffer.from(JSON.stringify(text)));
    console.log(text);
    await channel.close();
  }
  catch (error) {
    throw new Error(error)
  }
  finally {
    if (connection) await connection.close();
  };
})();  