import config from '../config.cjs';
import fs from 'fs';
import path from 'path';

const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "ping") {
    try {
      const start = new Date().getTime();

      // 1. Reaction Emoji Logic
      const reactionEmojis = ['⚡', '🚀', '💎', '🎯', '🔥'];
      const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
      await m.React(reactionEmoji);

      // 2. Count Commands (Reads all .js files in your plugins folder)
      // Note: Change 'plugins' to 'commands' if that is your folder name
      const commandsDir = path.join(process.cwd(), 'plugins');
      let totalCommands = 0;
      if (fs.existsSync(commandsDir)) {
          const files = fs.readdirSync(commandsDir);
          totalCommands = files.filter(file => file.endsWith('.js')).length;
      }

      const end = new Date().getTime();
      const responseTime = (end - start) / 1000;

      // 3. Media & Content
      const imageUrl = 'https://telegra.ph/file/dc3a328616ffc9c2b9f5f.jpg';
      const statusText = `*TIMNASA-XMD SPEED TEST* 🛡️\n\n` +
                         `*🚀 Latency:* ${responseTime.toFixed(2)}ms\n` +
                         `*📂 Commands:* ${totalCommands} Loaded\n` +
                         `*🔗 GitHub:* https://github.com/timnasax/TIMNASA-XMD\n\n` +
                         `_Systems Operational: No issues detected._`;

      // 4. Send Image with Professional Context Info
      await Matrix.sendMessage(m.from, {
        image: { url: imageUrl },
        caption: statusText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "TIMNASA-XMD ACTIVE",
            body: "The Most Powerful WhatsApp Bot",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com/channel/0029Vb6uo9yJ3juwi9GYgS47",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      // 5. Send Audio (Wimbo) from Buddy/nothing.mp3
      const audioPath = path.join(process.cwd(), 'Buddy', 'nothing.mp3');

      if (fs.existsSync(audioPath)) {
        await Matrix.sendMessage(m.from, {
          audio: fs.readFileSync(audioPath),
          mimetype: 'audio/mpeg',
          ptt: false // Sends as a music file (wimbo), not a voice note
        }, { quoted: m });
      }

    } catch (error) {
      console.error("Error in Ping Command:", error);
      // Fail-safe reply
      m.reply("⚠️ An error occurred, but TIMNASA-XMD is still online!");
    }
  }
};

export default ping;
