import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

let connection;
let channel;

const userKey = 'userKey';
const productKey= 'productKey';

const exchange = 'account';

const userMessage = {
  name: 'Caldas',
  age: 20, 
  state: 'Brazil',
  birthdate: new Date()
};

const productMessage = {
  name: 'RTX 3090 GALAX',
  price: 3900.00, 
  quantity: 5
};

(async () => {

  try {
    connection = await amqp.connect(`amqp://${process.env.RABBIT_USER}:${process.env.RABBIT_PASSWORD}@${process.env.RABBIT_HOST}:${process.env.RABBIT_PORT}`);
    channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'topic', { durable: false });
    await channel.publish(exchange, userKey, Buffer.from(JSON.stringify(userMessage)));
    channel.publish(exchange, productKey, Buffer.from(JSON.stringify(productMessage)));
    console.log('userMessage\n:', userMessage);
    console.log();
    console.log('productMessage\n:', productMessage);
    await channel.close();
  }
  catch (error) {
    throw new Error(error)
  }
  finally {
    if (connection) await connection.close();
  };
})();  