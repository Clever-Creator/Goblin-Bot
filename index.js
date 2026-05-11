const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");const pino = require("pino");


async function startBot() {
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
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("\n✅ GOBLIN BOT IS CONNECTED!");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const prefix = "."; // Hii ndio alama ya kuanzia amri
        
        // Kutambua kama meseji ni Command
        if (!text.startsWith(prefix)) return;
        
        const command = text.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
        const args = text.trim().split(/ +/).slice(1);

        // --- HAPA NDIPO TUNAPOONGEZA COMMANDS ---

        if (command === "menu" || command === "help") {
            let menuText = `*HELLO BOSS! THATS GOBLIN ROBOT*\n\n`;
            menuText += `*COMMANDS:* \n`;
            menuText += `➤ ${prefix}ping - Kuona kama niko macho\n`;
            menuText += `➤ ${prefix}mambo - Salamu\n`;
            menuText += `➤ ${prefix}owner - Mawasiliano ya bosi wangu\n`;
            menuText += `➤ ${prefix}vibe - Pata maneno ya hamasa\n`;
            
            await sock.sendMessage(from, { text: menuText });
        }

        if (command === "ping") {
            await sock.sendMessage(from, { text: "Speed yangu ni 100% Bosi! Niko tayari." });
        }

        if (command === "owner") {
            await sock.sendMessage(from, { text: "Owner wangu ni *G-O-B-L-I-N*!." });
        }

        if (command === "vibe") {
            const quotes = [
                "Pambana, hakuna anayekujua kesho yako!",
                "Mafanikio hayaji ukiwa umelala.",
                "Kuwa mbunifu kama bosi wangu aliyenitengeneza."
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            await sock.sendMessage(from, { text: `⚡ *VIBE CHECK:* \n\n${randomQuote}` });
        }
    });
}

startBot();
