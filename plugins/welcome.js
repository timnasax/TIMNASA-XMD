import config from '../config.cjs';
import moment from 'moment-timezone';

/**
 * TIMNASA TMD - ALL-IN-ONE GROUP EVENTS
 * Handles: .welcome on/off, .goodbye on/off, and Auto-Greetings.
 */

const gcEvent = async (Matrix, m) => {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : "";
    const text = body.slice(prefix.length + cmd.length).trim().toLowerCase();

    // 1. COMMANDS LOGIC (Toggle Settings)
    if (cmd === 'welcome' || cmd === 'goodbye') {
        if (!m.isGroup) return m.reply("*📛 THIS COMMAND IS ONLY FOR GROUPS*");

        try {
            const groupMetadata = await Matrix.groupMetadata(m.from);
            const participants = groupMetadata.participants;
            const botNumber = await Matrix.decodeJid(Matrix.user.id);
            
            const isBotAdmin = participants.find(p => p.id === botNumber)?.admin;
            const isSenderAdmin = participants.find(p => p.id === m.sender)?.admin;
            const isOwner = config.OWNER.includes(m.sender.split('@')[0]) || m.isOwner;

            // Security: Only Owner or Group Admins can change settings
            if (!isOwner && !isSenderAdmin) {
                return m.reply("*⚠️ ACCESS DENIED:* This command is for *Admins* or *Bot Owner* only.");
            }

            if (!isBotAdmin) return m.reply("*📛 BOT ERROR:* I need to be an *Admin* to manage these events.");

            if (text === 'on') {
                config[cmd.toUpperCase()] = true;
                return m.reply(`✅ *${cmd.toUpperCase()} SYSTEM ENABLED SUCCESSFULLY*`);
            } else if (text === 'off') {
                config[cmd.toUpperCase()] = false;
                return m.reply(`❌ *${cmd.toUpperCase()} SYSTEM DISABLED SUCCESSFULLY*`);
            } else {
                return m.reply(`*TIMNASA TMD MANAGER*\n\n*Current Status:* ${config[cmd.toUpperCase()] ? '🟢 ON' : '🔴 OFF'}\n*Usage:* ${prefix}${cmd} on/off`);
            }
        } catch (err) {
            console.error(err);
        }
    }
};

/**
 * 2. AUTOMATIC EVENT HANDLER
 * This part executes automatically when someone joins or leaves.
 */
export const handleGroupUpdate = async (Matrix, update) => {
    const { id, participants, action } = update;
    const channelJid = '120363406146813524@newsletter';
    const timeZone = "Africa/Nairobi";
    const currentTime = moment().tz(timeZone).format("HH:mm:ss, DD/MM/YYYY");

    try {
        const metadata = await Matrix.groupMetadata(id);
        const memberCount = metadata.participants.length;

        for (let jid of participants) {
            const userName = jid.split('@')[0];
            let message = "";
            let eventTitle = "";

            // --- WELCOME LOGIC ---
            if (action === 'add' && config.WELCOME) {
                eventTitle = "NEW MEMBER JOINED 📥";
                message = `*✨ WELCOME TO ${metadata.subject} ✨*\n\n` +
                          `*👤 User:* @${userName}\n` +
                          `*📅 Joined At:* ${currentTime}\n` +
                          `*📊 Group Size:* ${memberCount} members\n\n` +
                          `> Welcome to our community! Please stay active and follow the rules.\n\n` +
                          `*TIMNASA TMD • SYSTEM*`;
            } 
            // --- GOODBYE LOGIC ---
            else if ((action === 'remove' || action === 'leave') && config.GOODBYE) {
                eventTitle = "MEMBER LEFT 📤";
                message = `*👋 GOODBYE FROM ${metadata.subject} *\n\n` +
                          `*👤 User:* @${userName}\n` +
                          `*📅 Departure Time:* ${currentTime}\n` +
                          `*📊 Remaining:* ${memberCount} members\n\n` +
                          `> We are sorry to see you go. Wishing you the best ahead!\n\n` +
                          `*TIMNASA TMD • SYSTEM*`;
            }

            if (message) {
                await Matrix.sendMessage(id, {
                    text: message,
                    contextInfo: {
                        mentionedJid: [jid],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: channelJid,
                            newsletterName: "TIMNASA TMD • LOGS",
                            serverMessageId: 143,
                        },
                        externalAdReply: {
                            title: eventTitle,
                            body: `Group: ${metadata.subject}`,
                            mediaType: 1,
                            thumbnailUrl: metadata.subject, // Uses group profile picture
                            renderLargerThumbnail: false,
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error("Event Handler Error:", error);
    }
};

export default gcEvent;
