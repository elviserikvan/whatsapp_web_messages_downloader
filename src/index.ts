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

    if (!fs.existsSync('chats')) {
        fs.mkdirSync('chats');
    }

    for (const chat of chats) {
        const chatId = chat.id._serialized;
        console.log(`Fetching last 100 messages for chat: ${chatId}`);

        const messages: Message[] = await chat.fetchMessages({ limit: 100 });
        
        const chatMessages = messages.map(msg => ({
            from: msg.from,
            to: msg.to,
            body: msg.body,
            timestamp: msg.timestamp,
            fromMe: msg.fromMe
        }));

        fs.writeFileSync(`chats/${chatId}.json`, JSON.stringify(chatMessages, null, 2));
        console.log(`Saved ${messages.length} messages for chat ${chatId}`);
    }

    console.log('All chats have been saved.');
    await client.destroy();
});

client.initialize();