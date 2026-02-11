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
    
    // Command triggers
    if (!['menu', 'help', 'list'].includes(cmd)) return;

    // --- SYSTEM TIME & UPTIME ---
    const uptime = process.uptime();
    const day = Math.floor(uptime / (24 * 3600));
    const hours = Math.floor((uptime % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");

    // --- DYNAMIC PLUGINS LOADING ---
    const pluginsPath = path.join(process.cwd(), 'plugins'); 
    let categories = {
      'DOWNLOAD': [],
      'GROUP': [],
      'OWNER': [],
      'TOOLS': [],
      'AI': [],
      'SEARCH': [],
      'STALK': [],
      'MAIN': []
    };

    if (fs.existsSync(pluginsPath)) {
      const files = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));
      
      files.forEach(file => {
        const name = file.replace('.js', '');
        
        // --- CATEGORIZATION LOGIC ---
        if (['ytmp3', 'ytmp4', 'play', 'song', 'video', 'fb', 'tiktok', 'insta', 'apk', 'gitclone', 'gdrive', 'mediafire'].some(v => name.includes(v))) {
          categories['DOWNLOAD'].push(name);
        } else if (['add', 'kick', 'promote', 'demote', 'hidetag', 'tagall', 'antilink', 'group', 'welcome', 'setname', 'setdesc'].some(v => name.includes(v))) {
          categories['GROUP'].push(name);
        } else if (['setpp', 'block', 'unblock', 'join', 'leave', 'restart', 'mode', 'anticall', 'autotyping', 'autoread'].some(v => name.includes(v))) {
          categories['OWNER'].push(name);
        } else if (['ai', 'gpt', 'dalle', 'remini', 'gemini', 'bug', 'report'].some(v => name.includes(v))) {
          categories['AI'].push(name);
        } else if (['calc', 'tempmail', 'checkmail', 'trt', 'tts'].some(v => name.includes(v))) {
          categories['TOOLS'].push(name);
        } else if (['yts', 'imdb', 'google', 'gimage', 'pinterest', 'lyrics', 'ytsearch'].some(v => name.includes(v))) {
          categories['SEARCH'].push(name);
        } else if (['truecaller', 'instastalk', 'githubstalk'].some(v => name.includes(v))) {
          categories['STALK'].push(name);
        } else if (['ping', 'alive', 'owner', 'infobot', 'runtime'].some(v => name.includes(v))) {
          categories['MAIN'].push(name);
        } else {
          categories['MAIN'].push(name); 
        }
      });
    }

    // --- DASHBOARD UI CONSTRUCTION ---
    let menuText = `
╭━━━〔 *${config.BOT_NAME || 'TIMNASA-XMD'}* 〕━━━┈⊷
┃★╭──────────────
┃★│ 👤 *User:* ${m.pushName}
┃★│ ⏳ *Uptime:* ${day}d ${hours}h ${minutes}m
┃★│ ⌚ *Time:* ${time}
┃★│ 🛠️ *Prefix:* [ ${prefix} ]
┃★│ 📚 *Plugins:* ${fs.readdirSync(pluginsPath).length} files
┃★╰──────────────
╰━━━━━━━━━━━━━━━┈⊷

> Hello🌹 *${m.pushName}*! Here is the list of available commands synced from the plugins folder:
`;

    Object.keys(categories).forEach(category => {
      if (categories[category].length > 0) {
        menuText += `\n╭━━〔 *${category} MENU* 〕━━┈⊷\n`;
        menuText += `┃◈╭─────────────·๏\n`;
        categories[category].sort().forEach(c => {
          menuText += `┃◈┃• ${prefix}${c}\n`;
        });
        menuText += `┃◈└───────────┈⊷\n`;
        menuText += `╰──────────────┈⊷\n`;
      }
    });

    menuText += `\n> *Timnasa Softwares © 2026*`;

    // --- IMAGE HANDLING ---
    let menuImage;
    const defaultImg = 'https://files.catbox.moe/jmyv02.jpg';
    try {
      const imgUrl = config.MENU_IMAGE || defaultImg;
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      menuImage = Buffer.from(response.data, 'binary');
    } catch {
      menuImage = fs.readFileSync('./Carltech/mymenu.jpg'); 
    }

    // --- SEND MESSAGE WITH CHANNEL JID (NEWSLETTER) ---
    await Matrix.sendMessage(m.from, {
      image: menuImage,
      caption: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363406146813524@newsletter',
          newsletterName: "TimnasaTech Developers",
          serverMessageId: 143
        },
        externalAdReply: {
            title: "TIMNASA-TMD DYNAMIC MENU",
            body: "Reading from plugins folder...",
            thumbnail: menuImage,
            sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
            mediaType: 1,
            renderLargerThumbnail: true
        }
      }
    }, { quoted: m });

  } catch (error) {
    console.error('Menu Error:', error);
  }
};

export default menu;
