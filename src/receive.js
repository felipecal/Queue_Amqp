import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection;
let channel;

const queue = 'account-queue';
const exchange = 'account';

(async () => {
  try {
    connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'fanout', { durable: false });
    await channel.assertQueue(queue, { exclusive: true });
    await channel.bindQueue(queue, exchange, '')
    await channel.consume(queue, (message) => {
      if (!message){
        throw new Error('Menssage with value undefined.')
      }
        const msg = message.content.toString()
        const messageInJson = JSON.parse(msg);
        const newDate = new Date(messageInJson.birthdate)
        console.log(`Name: ${messageInJson.name}\nAge: ${messageInJson.age}\nState: ${messageInJson.state}\nDate: ${newDate}`);
    }, { noAck: true });
    console.log(' 🚀 🚀 [*] Waiting for logs 🚀 🚀 .');
  } catch (error) {
    throw new Error(error);
  }
})();