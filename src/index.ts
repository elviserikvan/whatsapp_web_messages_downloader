import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import * as fs from 'fs';

const client: Client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox']
    }
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');

    const chats = await client.getChats();
    const allMessages: any[] = [];

    for (const chat of chats) {
        const messages: Message[] = await chat.fetchMessages({ limit: Infinity });
        for (const msg of messages) {
            allMessages.push({
                from: msg.from,
                to: msg.to,
                body: msg.body,
                timestamp: msg.timestamp
            });
        }
    }

    fs.writeFileSync('whatsapp_messages.json', JSON.stringify(allMessages, null, 2));
    console.log('All messages have been saved to whatsapp_messages.json');
    await client.destroy();
});

client.initialize();
