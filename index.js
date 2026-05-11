const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");const pino = require("pino");


async function startGemini() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startGemini();
        } else if (connection === "open") {
            console.log("✅ GEMINI-MD IMEWAKA!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        
        if (text && text.toLowerCase() === "mambo") {
            await sock.sendMessage(msg.key.remoteJid, { text: "Mambo vipi! Mimi ni Gemini-MD, bot iliyotengenezwa na bosi wangu mpya!" });
        }
    });
}

startGemini();