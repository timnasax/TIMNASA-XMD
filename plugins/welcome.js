import config from '../config.cjs';

const gcEvent = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'welcome') {
    // 1. Check if it's a group
    if (!m.isGroup) return m.reply("*📛 THIS COMMAND CAN ONLY BE USED IN GROUPS*");

    try {
      const groupMetadata = await Matrix.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      
      // 2. Identify Bot, Owner, and Sender status
      const botNumber = await Matrix.decodeJid(Matrix.user.id);
      const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;
      const isSenderAdmin = participants.find(p => p.id === m.sender)?.admin;
      
      // Owner/Sudo Check (Checks config.OWNER which is usually an array or string)
      const isOwner = config.OWNER.includes(m.sender.split('@')[0]) || m.isOwner;

      // 3. Authorization Logic: Must be Owner OR Admin
      if (!isOwner && !isSenderAdmin) {
        return m.reply("*⚠️ ACCESS DENIED*\nThis command is reserved for *Group Admins* and the *Bot Owner* only.");
      }

      // 4. Bot Admin Check
      if (!isBotAdmin) return m.reply("*📛 BOT ERROR:* I need to be an *Admin* to manage welcome messages.");

      let responseMessage;
      const channelInfo = {
        newsletterJid: '120363406146813524@newsletter',
        newsletterName: "TIMNASA TMD • SYSTEM",
        serverMessageId: 143
      };

      // 5. Handle Logic
      if (text === 'on') {
        config.WELCOME = true;
        responseMessage = "✅ *WELCOME SYSTEM ACTIVATED*\n\nTimnasa Tmd will now greet new members and say goodbye to those who leave.";
      } else if (text === 'off') {
        config.WELCOME = false;
        responseMessage = "❌ *WELCOME SYSTEM DEACTIVATED*\n\nAutomated greetings have been turned off.";
      } else {
        // Professional Usage Guide
        responseMessage = `✨ *TIMNASA TMD WELCOME MANAGER*\n\n*Current Status:* ${config.WELCOME ? '🟢 Enabled' : '🔴 Disabled'}\n\n*Commands:* \n📝 \`${prefix}welcome on\` - Enable\n📝 \`${prefix}welcome off\` - Disable\n\n*Authorized Users:* \n• Group Admins\n• Bot Owner/Sudo`;
      }

      // 6. Send Response
      await Matrix.sendMessage(m.from, { 
        text: responseMessage,
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: channelInfo,
          mentionedJid: [m.sender],
        }
      }, { quoted: m });

    } catch (error) {
      console.error("Error in welcome command:", error);
      await Matrix.sendMessage(m.from, { text: "❌ *SYSTEM ERROR:* Unable to process the request." }, { quoted: m });
    }
  }
};

export default gcEvent;
