import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { File } from 'megajs';
import NodeCache from 'node-cache';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
import zlib from 'zlib';

const { emojis, doReact } = pkg;

// Fix for ES Modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prefix = process.env.PREFIX || config.PREFIX;
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");

let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

// Stores
const messageStore = new Map();
const autoJoinGroups = new Set();

// Configurations
const ANTI_DELETE_ENABLED = config.ANTI_DELETE || false;
const AUTO_VIEW_STATUS = config.AUTO_VIEW_STATUS || false;
const AUTO_LIKE_STATUS = config.AUTO_LIKE_STATUS || false;
const LIKE_EMOJIS = ['👍', '❤️', '🔥', '👏', '🎉', '🤩', '😍', '⚡', '💯', '✨'];
const BOT_OWNER = config.BOT_OWNER || "";
const SEND_CONNECT_MESSAGE = config.SEND_CONNECT_MESSAGE !== false;

// Mandatory Groups
const MANDATORY_GROUPS = [
    { name: "Group 1", inviteCode: "JazGLNBxW5XDVEst3PN4kj" },
    { name: "Group 2", inviteCode: "0029Vb6uo9yJ3juwi9GYgS47" },
    { name: "Group 3", inviteCode: "JazGLNBxW5XDVEst3PN4kj" }
];

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// --- Session Loader ---
async function loadTimnasaSession() {
    console.log(chalk.cyan("🔍 Processing TimnasaTech Session..."));
    if (!config.SESSION_ID || !config.SESSION_ID.startsWith("TimnasaTech~")) return false;

    try {
        const compressedBase64 = config.SESSION_ID.split("TimnasaTech~");
        const buffer = Buffer.from(compressedBase64, 'base64');
        
        // Handle GZIP if present
        let sessionData;
        if (buffer === 0x1f && buffer === 0x8b) {
            sessionData = zlib.gunzipSync(buffer).toString('utf-8');
        } else {
            sessionData = buffer.toString('utf-8');
        }

        await fs.promises.writeFile(credsPath, sessionData);
        return true;
    } catch (e) {
        console.error(chalk.red("❌ Session Error:"), e.message);
        return false;
    }
}

// --- Features ---
async function handleAntiDelete(mek, Matrix) {
    if (!ANTI_DELETE_ENABLED || mek.message?.protocolMessage?.type !== 0) return;
    const deletedId = mek.message.protocolMessage.key.id;
    const stored = messageStore.get(deletedId);
    if (!stored) return;

    const report = `🚨 *ANTI-DELETE RECOVERED* 🚨\n👤 *From:* ${stored.pushName}\n📝 *Content:* ${stored.message?.conversation || "Media/Other"}`;
    if (BOT_OWNER) await Matrix.sendMessage(BOT_OWNER, { text: report });
    await Matrix.sendMessage(mek.key.remoteJid, { text: `🗑️ *Recovered Message:* \n\n${stored.message?.conversation || "Media Content"}` });
}

async function handleAutoJoinGroups(Matrix) {
    console.log(chalk.yellow("🔄 Auto-joining groups..."));
    for (const group of MANDATORY_GROUPS) {
        try {
            await Matrix.groupAcceptInvite(group.inviteCode);
            await new Promise(r => setTimeout(r, 3000));
        } catch (e) { console.log(chalk.gray(`Skipped ${group.name}: ${e.message}`)); }
    }
}

async function sendConnectMessage(Matrix) {
    if (!SEND_CONNECT_MESSAGE) return;
    const target = BOT_OWNER || Matrix.user.id;
    const msg = {
        image: { url: "https://files.catbox.moe/jmyv02.jpg" },
        caption: `🚀 *Timnasa-TMD Online!*\n\n*Developer:* Timoth\n*Prefix:* ${prefix}\n*Status:* Connected ✅`
    };
    await Matrix.sendMessage(target, msg);
}

// --- Main Bot Logic ---
async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();

    const Matrix = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: useQR,
        browser: ["TimnasaTech", "Safari", "3.0"],
        auth: state,
    });

    Matrix.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                start();
            } else {
                console.log(chalk.red("❌ Logged out. Delete session folder."));
            }
        } else if (connection === 'open') {
            console.log(chalk.green.bold("✅ Connected Successfully!"));
            if (initialConnection) {
                await handleAutoJoinGroups(Matrix);
                await sendConnectMessage(Matrix);
                initialConnection = false;
            }
        }
    });

    Matrix.ev.on('creds.update', saveCreds);

    Matrix.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages;
        if (!mek.message || mek.key.fromMe) return;

        // Message Store for Anti-Delete
        messageStore.set(mek.key.id, mek);
        if (messageStore.size > 500) messageStore.delete(messageStore.keys().next().value);

        // Run Features
        await handleAntiDelete(mek, Matrix);
        
        // Auto View Status
        if (mek.key.remoteJid === 'status@broadcast' && AUTO_VIEW_STATUS) {
            await Matrix.readMessages([mek.key]);
        }

        // Auto React
        if (config.AUTO_REACT) {
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await doReact(randomEmoji, mek, Matrix);
        }

        // Call External Handler
        await Handler(chatUpdate, Matrix, pino({ level: 'silent' }));
    });

    Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
    Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));
}

// --- Init & Express ---
async function init() {
    console.log(chalk.cyan.bold("🚀 TimnasaTech Bot Starting..."));
    if (fs.existsSync(credsPath)) {
        await start();
    } else if (await loadTimnasaSession()) {
        await start();
    } else {
        useQR = true;
        await start();
    }
}

app.get('/', (req, res) => {
    res.send(`<body style="background:#000;color:#0f0;text-align:center;"><h1>Timnasa-TMD is Running</h1></body>`);
});

app.listen(PORT, () => {
    console.log(orange(`🌐 Server on port ${PORT}`));
    init();
});
