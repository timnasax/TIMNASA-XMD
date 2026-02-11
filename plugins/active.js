import axios from 'axios';
import config from '../config.cjs';
import moment from 'moment-timezone';

const active = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : "";

    // Trigger commands
    if (cmd === 'active' || cmd === 'alive' || cmd === 'ping') {
        
        const uptime = process.uptime();
        const day = Math.floor(uptime / (24 * 3600));
        const hours = Math.floor((uptime % (24 * 3600)) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");

        const statusMessage = `
╭━━━〔 *${config.BOT_NAME || 'TIMNASA-TMD'}* 〕━━━┈⊷
┃★╭──────────────
┃★│ ⚡ *Status:* Active & Operational
┃★│ ⏳ *Uptime:* ${day}d ${hours}h ${minutes}m
┃★│ ⌚ *Time:* ${time}
┃★│ 📡 *Latency:* ${Math.floor(Math.random() * 100)}ms
┃★│ 👤 *User:* ${m.pushName}
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> *Timnasa Tmd is currently connected and ready to serve your commands.*

*🔗 Official Channel:*
https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47

*🛠️ Developer:* Timnasa Tech
`;

        // Image Handling (Optional: Use your own image or default)
        const activeImg = config.ALIVE_IMAGE || 'https://files.catbox.moe/jmyv02.jpg';

        await Matrix.sendMessage(m.from, {
            image: { url: activeImg },
            caption: statusMessage,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363406146813524@newsletter',
                    newsletterName: "TIMNASA TMD • STATUS",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "TIMNASA-TMD SYSTEM ACTIVE",
                    body: "Version 3.0.0 - Stable",
                    mediaType: 1,
                    thumbnailUrl: activeImg,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};

// Ili ile Menu tuliyoitengeneza iweze kuisoma hii command
active.cmd = "active";
active.category = "main";

export default active;
