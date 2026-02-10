import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import path from 'path';
import axios from 'axios';
import config from '../config.cjs';

const menu = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    if (!['menu', 'help', 'list'].includes(cmd)) return;

    // --- SYSTEM INFO ---
    const uptime = process.uptime();
    const day = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");

    // --- AUTOMATIC CATEGORIZATION ---
    const commandsPath = path.join(process.cwd(), 'commands');
    let categories = {
      'DOWNLOAD': [],
      'GROUP': [],
      'OWNER': [],
      'TOOLS': [],
      'OTHERS': []
    };

    if (fs.existsSync(commandsPath)) {
      const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      files.forEach(file => {
        const name = file.replace('.js', '');
        // Logic ya kupanga (unaweza kuongeza maneno hapa)
        if (['ytmp3', 'ytmp4', 'play', 'song', 'video', 'fb', 'tiktok', 'insta', 'apk'].some(v => name.includes(v))) {
          categories['DOWNLOAD'].push(name);
        } else if (['add', 'kick', 'promote', 'demote', 'hidetag', 'tagall', 'antilink', 'group'].some(v => name.includes(v))) {
          categories['GROUP'].push(name);
        } else if (['setpp', 'block', 'unblock', 'restart', 'mode', 'join', 'leave'].some(v => name.includes(v))) {
          categories['OWNER'].push(name);
        } else if (['calc', 'ai', 'gpt', 'runtime', 'ping', 'trt'].some(v => name.includes(v))) {
          categories['TOOLS'].push(name);
        } else {
          categories['OTHERS'].push(name);
        }
      });
    }

    // --- KUJENGA MUUNDO WA UKURASA (PAGE VIEW) ---
    let menuText = `
╭━━━〔 *${config.BOT_NAME || 'TIMNASA-XMD'}* 〕━━━┈⊷
┃★╭──────────────
┃★│ 👤 User: *${m.pushName}*
┃★│ ⏳ Uptime: *${day}d ${hours}h ${minutes}m*
┃★│ ⌚ Time: *${time}*
┃★│ 🛠️ Prefix: [ ${prefix} ]
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> Hello🌹 *${m.pushName}*! Chagua kategoria ya amri hapa chini:
`;

    // Kutengeneza list ya kurasa/categories
    for (let category in categories) {
      if (categories[category].length > 0) {
        menuText += `\n╭━━〔 *${category} MENU* 〕━━┈⊷\n`;
        menuText += `┃◈╭─────────────·๏\n`;
        categories[category].forEach(c => {
          menuText += `┃◈┃• ${prefix}${c}\n`;
        });
        menuText += `┃◈└───────────┈⊷\n`;
        menuText += `╰──────────────┈⊷\n`;
      }
    }

    menuText += `\n> *Timnasa Softwares 2026*`;

    // --- HANDLING IMAGE ---
    let menuImage;
    const defaultImg = 'https://files.catbox.moe/jmyv02.jpg';
    try {
      const imgUrl = config.MENU_IMAGE || defaultImg;
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      menuImage = Buffer.from(response.data, 'binary');
    } catch {
      menuImage = fs.readFileSync('./Carltech/mymenu.jpg'); 
    }

    // --- TUMA MENU ---
    await Matrix.sendMessage(m.from, {
      image: menuImage,
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
            title: "TIMNASA-TMD COMMANDS PAGE",
            body: "Powered by Timoth",
            thumbnail: menuImage,
            sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
            mediaType: 1,
            renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

    // --- TUMA SAUTI ---
    const audioPath = './Buddy/nothing.mp3';
    if (fs.existsSync(audioPath)) {
      await Matrix.sendMessage(m.from, {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mpeg',
        ptt: true
      }, { quoted: m });
    }

  } catch (error) {
    console.error('Menu Error:', error);
  }
};

export default menu;
