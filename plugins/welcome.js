import config from '../config.cjs';
import moment from 'moment-timezone';

/**
 * TIMNASA TMD - SELF-CONTAINED GROUP EVENTS
 * This file handles both the toggle commands and the event listeners.
 */

const gcEvent = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : "";
    const text = body.slice(prefix.length + cmd.length).trim().toLowerCase();

    // 1. COMMAND HANDLER (Toggle On/Off)
    if (cmd === 'welcome' || cmd === 'goodbye') {
        if (!m.isGroup) return m.reply("*📛 THIS COMMAND IS ONLY FOR GROUPS*");

        const groupMetadata = await Matrix.groupMetadata(m.from);
        const participants = groupMetadata.participants;
        const botNumber = await Matrix.decodeJid(Matrix.user.id);
        
        const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;
        const isSenderAdmin = participants.find(p => p.id === m.sender)?.admin;
        const isOwner = config.OWNER.includes(m.sender.split('@')[0]) || m.isOwner;

        if (!isOwner && !isSenderAdmin) return m.reply("*⚠️ ACCESS DENIED: Admins or Owner Only*");
        if (!isBotAdmin) return m.reply("*📛 BOT ERROR: I need Admin rights to manage events.*");

        if (text === 'on') {
            config[cmd.toUpperCase()] = true;
            return m.reply(`✅ *${cmd.toUpperCase()} SYSTEM ENABLED*`);
        } else if (text === 'off') {
            config[cmd.toUpperCase()] = false;
            return m.reply(`❌ *${cmd.toUpperCase()} SYSTEM DISABLED*`);
        } else {
            return m.reply(`*USAGE:* ${prefix}${cmd} on/off\n*STATUS:* ${config[cmd.toUpperCase()] ? 'ON' : 'OFF'}`);
        }
    }
};

/**
 * EVENT LISTENER
 * This function should be called by your connection handler
 * for 'group-participants.update' events.
 */
export const handleGroupUpdate = async (Matrix, update) => {
    const { id, participants, action } = update;
    
    // Check if goodbye is enabled in config
    if (action === 'remove' && config.GOODBYE) {
        try {
            const metadata = await Matrix.groupMetadata(id);
            const timeZone = "Africa/Nairobi";
            const currentTime = moment().tz(timeZone).format("HH:mm:ss, DD/MM/YYYY");
            
            for (let jid of participants) {
                const userName = jid.split('@')[0];
                const memberCount = metadata.participants.length;

                const goodbyeTemplate = `*👋 USER LEFT THE GROUP*\n\n` +
                    `*👤 User:* @${userName}\n` +
                    `*📅 Departure Time:* ${currentTime}\n` +
                    `*📊 Members Remaining:* ${memberCount}\n\n` +
                    `> *We wish them the best wherever they go.* ✨\n\n` +
                    `*TIMNASA TMD • SYSTEM*`;

                await Matrix.sendMessage(id, {
                    text: goodbyeTemplate,
                    contextInfo: {
                        mentionedJid: [jid],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363406146813524@newsletter',
                            newsletterName: "TIMNASA TMD • LOGS",
                            serverMessageId: 143,
                        },
                        externalAdReply: {
                            title: "MEMBER DEPARTED",
                            body: `Group: ${metadata.subject}`,
                            mediaType: 1,
                            thumbnailUrl: "https://i.imgur.com/your-image.jpg", // Replace with your logo
                            renderLargerThumbnail: false,
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Goodbye Event Error:", error);
        }
    }
};

export default gcEvent;
