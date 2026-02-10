import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';
import path from 'path';
import axios from 'axios';

const menu = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    // Commands za kuwasha menu
    const validCommands = ['menu', 'help', 'list', 'fullmenu'];
    if (!validCommands.includes(cmd)) return;

    // --- SYSTEM INFO ---
    const uptime = process.uptime();
    const day = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
    const date = moment().tz("Africa/Nairobi").format("DD/MM/YYYY");

    // --- DYNAMIC COMMAND LOADING ---
    // Inasoma files zote kwenye folder la 'commands'
    const commandsPath = path.join(process.cwd(), 'commands');
    let commandList = "";
    
    if (fs.existsSync(commandsPath)) {
        const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        // Inatengeneza list ya commands kwa emoji ya doti
        commandList = files.map(file => `┃◈┃• ${file.replace('.js', '')}`).join('\n');
    } else {
        commandList = "┃◈┃• No commands found.";
    }

    // --- MENU STRUCTURE ---
    const str = `
╭━━━〔 *${config.BOT_NAME || 'TIMNASA-XMD'}* 〕━━━┈⊷
┃★╭──────────────
┃★│ Owner : *${config.OWNER_NAME || 'Timoth'}*
┃★│ User : *${m.pushName}*
┃★│ Mode : *${config.MODE}*
┃★│ Platform : *${os.platform()}*
┃★│ Uptime : *${day}d ${hours}h ${minutes}m*
┃★│ Time : *${time}*
┃★│ Prefix : [ ${prefix} ]
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> Hello🌹 *${m.pushName}*, hizi hapa ni amri (commands) zilizopo kwenye mfumo wangu kwa sasa:

╭━━〔 *All Commands List* 〕━━┈⊷
┃◈╭─────────────·๏
${commandList}
┃◈└───────────┈⊷
╰──────────────┈⊷

*🛡️ SYSTEM STATUS*
┃◈ Anti-Delete: ${config.ANTI_DELETE ? '✅' : '❌'}
┃◈ Auto-View: ${config.AUTO_VIEW_STATUS ? '✅' : '❌'}

> *Powered by Timnasa Softwares*`;

    // --- HANDLING IMAGE ---
    let menuImage;
    const defaultImg = 'https://files.catbox.moe/jmyv02.jpg'; // Picha yako uliyotumia mwanzo
    
    try {
        const imgUrl = config.MENU_IMAGE || defaultImg;
        const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        menuImage = Buffer.from(response.data, 'binary');
    } catch {
        // Fallback kama internet ikisumbua au picha haipo
        menuImage = fs.readFileSync('./Carltech/mymenu.jpg'); 
    }

    // --- SEND MENU ---
    await Matrix.sendMessage(m.from, {
      image: menuImage,
      caption: str,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
            title: "TIMNASA-TMD DASHBOARD",
            body: "Active & Stable",
            thumbnail: menuImage,
            sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
            mediaType: 1,
            renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // --- SEND AUDIO (VOICE NOTE) ---
    const audioPath = './Buddy/nothing.mp3';
    if (fs.existsSync(audioPath)) {
        await Matrix.sendMessage(m.from, {
            audio: fs.readFileSync(audioPath),
            mimetype: 'audio/mpeg',
            ptt: true,
            waveform: [0, 99, 0, 99, 0, 99, 0]
        }, { quoted: m });
    }

  } catch (error) {
    console.error('Menu Error:', error);
  }
};

export default menu;
