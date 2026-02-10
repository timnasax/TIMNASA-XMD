import config from '../config.cjs';
import fs from 'fs';
import path from 'path';

const ping = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX || '.';
    const body = m.body || '';
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (cmd === "ping2") {
      const start = new Date().getTime();

      // 1. React to the message
      await m.React('⚡');

      // 2. Identify the correct path for commands/plugins
      // We check both 'plugins' and 'commands' folders
      let totalCommands = 0;
      const folders = ['plugins', 'commands'];
      
      for (const folder of folders) {
          const dirPath = path.join(process.cwd(), folder);
          if (fs.existsSync(dirPath)) {
              const files = fs.readdirSync(dirPath);
              totalCommands += files.filter(file => file.endsWith('.js') || file.endsWith('.cjs')).length;
          }
      }

      const end = new Date().getTime();
      const responseTime = (end - start) / 1000;

      // 3. Prepare Message Content
      const imageUrl = 'https://telegra.ph/file/dc3a328616ffc9c2b9f5f.jpg';
      const statusText = `*TIMNASA-XMD SPEED TEST* 🛡️\n\n` +
                         `*🚀 Latency:* ${responseTime.toFixed(2)}ms\n` +
                         `*📂 Commands:* ${totalCommands} Loaded\n` +
                         `*🔗 Repo:* github.com/timnasax/TIMNASA-XMD\n\n` +
                         `_Status: Online and Secure_`;

      // 4. Send Image with Ad-Reply Context
      await Matrix.sendMessage(m.from, {
        image: { url: imageUrl },
        caption: statusText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "TIMNASA-XMD SYSTEM PING",
            body: "Active & High Speed",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // 5. Send Audio from Buddy folder
      const audioPath = path.join(process.cwd(), 'Buddy', 'nothing.mp3');

      if (fs.existsSync(audioPath)) {
        await Matrix.sendMessage(m.from, {
          audio: fs.readFileSync(audioPath),
          mimetype: 'audio/mpeg',
          ptt: false 
        }, { quoted: m });
      } else {
          console.log("Audio file missing at: " + audioPath);
      }
    }
  } catch (error) {
    console.error("Critical Error in Ping Command:", error);
  }
};

export default ping;
