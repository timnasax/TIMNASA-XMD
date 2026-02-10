import config from '../config.cjs';
import fs from 'fs';
import path from 'path';

const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "ping2") {
    const start = new Date().getTime();

    // Emojis
    const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
    const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    // Weka Reaction
    await m.React(textEmoji);

    const end = new Date().getTime();
    const responseTime = (end - start) / 1000;

    // 1. Maandalizi ya Picha na Maandishi
    const imageUrl = 'https://telegra.ph/file/dc3a328616ffc9c2b9f5f.jpg'; // URL yako ya picha
    const text = `*Timnasa Tech Speed: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

    // 2. Tuma Picha na Context Info
    await Matrix.sendMessage(m.from, {
      image: { url: imageUrl },
      caption: text,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363406146813524@newsletter',
          newsletterName: "Timnasa-Tech",
          serverMessageId: 143
        }
      }
    }, { quoted: m });

    // 3. Tuma Audio kutoka file la Buddy/nothing.mp3
    const audioPath = path.join(process.cwd(), 'Buddy', 'nothing.mp3');

    if (fs.existsSync(audioPath)) {
      await Matrix.sendMessage(m.from, {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mpeg',
        ptt: true // true inatuma kama Voice Note, false inatuma kama audio file
      }, { quoted: m });
    } else {
      console.log("Faili la audio halijapatikana kwenye: " + audioPath);
    }
  }
};

export default ping;
