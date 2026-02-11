import config from '../config.cjs';

const speed = async (Matrix, m) => {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : "";

    if (cmd === 'speed') {
        // Kuhesabu kasi ya kuitikia (Latency)
        const timestamp = Date.now();
        const latency = Date.now() - timestamp;

        // Picha itakayotumwa
        const speedImg = config.MENU_IMAGE || 'https://files.catbox.moe/jmyv02.jpg';

        const speedMessage = `
*🚀 TIMNASA-TMD SPEED*

*📡 Latency:* ${latency}ms
*🤖 Server:* Active
*💻 Mode:* Public
*⏳ Runtime:* ${process.uptime().toFixed(0)}s

> *TIMNASA-TMD PERFORMANCE TEST*`;

        await Matrix.sendMessage(m.from, {
            image: { url: speedImg },
            caption: speedMessage,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363406146813524@newsletter',
                    newsletterName: "TIMNASA TMD • PERFORMANCE",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "SPEED TEST RESULTS",
                    body: `Connection Speed: ${latency}ms`,
                    mediaType: 1,
                    thumbnailUrl: speedImg,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};

// Kiashiria kwa ajili ya Dynamic Menu yako mpya
speed.cmd = "speed";
speed.category = "main";

export default speed;
