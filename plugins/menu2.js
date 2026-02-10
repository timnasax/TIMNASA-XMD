import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import config from '../config.cjs';

const menu = async (Matrix, mek, pref) => {
    try {
        const pushname = mek.pushName || 'User';
        const date = moment().tz('Africa/Nairobi').format('DD/MM/YYYY');
        const time = moment().tz('Africa/Nairobi').format('HH:mm:ss');
        
        // Njia ya kwenda kwenye folder la commands
        // Badilisha 'commands' iwe jina la folder lako la commands
        const commandsPath = path.join(process.cwd(), 'commands'); 
        let menuSections = "";

        if (fs.existsSync(commandsPath)) {
            const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            // Tunatengeneza list ya commands kwa kuondoa '.js' kwenye jina la file
            const commandList = files.map(file => `  ○ ${pref}${file.replace('.js', '')}`).join('\n');
            menuSections = `\n*📜 AVAILABLE COMMANDS*\n${commandList}`;
        } else {
            menuSections = "\n⚠️ Folder la commands halijapatikana.";
        }

        let menuText = `
╭──────────━⊷ ⁠⁠⁠⁠
║   *TIMNASA-XMD*
╰──────────━⊷
╭──────────━⊷
║ 👤 *User:* ${pushname}
║ 🛠️ *Prefix:* ${pref}
║ 📅 *Date:* ${date}
║ ⌚ *Time:* ${time}
║ 🚀 *Mode:* ${config.MODE}
╰──────────━⊷
${menuSections}

*🛡️ SYSTEM STATUS*
○ Anti-Delete: ${config.ANTI_DELETE ? '✅' : '❌'}
○ Auto Status: ${config.AUTO_VIEW_STATUS ? '✅' : '❌'}

> Powered by Timnasa Tech`;

        await Matrix.sendMessage(mek.key.remoteJid, {
            image: { url: "https://files.catbox.moe/jmyv02.jpg" },
            caption: menuText
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        await Matrix.sendMessage(mek.key.remoteJid, { text: "Error loading commands dynamicly." });
    }
};

export default menu;
