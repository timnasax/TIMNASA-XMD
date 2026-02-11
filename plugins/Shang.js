import config from '../config.cjs';

// Hifadhi ya muda ya hali ya Sheng (Memory Storage)
const shengMode = {
    enabled: false, 
    users: {} 
};

const triggerWords = [
    "yooh", "wozza", "mzee", "mkuu niaje", "bro", "sup", "mambo", "uko aje", "mkuu",
    "niaje", "freshi", "sasa", "rada", "vipi", "kiongos", "form ni gani", "gotea", "luku",
    "mbogi", "rieng", "mca", "nadai bot", "niko fiti", "buda", "niko rada"
];

const shengReplies = {
    "bera": "Yooh semaje mzee, unadai bot ama?",
    "wozza": "Wozza mzee, form ni gani mkuu?",
    "mzee": "Sema mzee, form ni gani? Uko poa?",
    "mkuu niaje": "Poa mzee? semaje mkuu ",
    "bro": "Rada mkuu semaje?",
    "sup": "Sup, bruv semaje",
    "mambo": "Poa sana mkuu. Unasema aje?",
    "uko aje": "Niko poa mkuu, maybe wewe?",
    "kiongos": "rada mkuu 😂",
    "freshi": "Freshi kama mdogo, form ni sawa!",
    "hustle": "Hustle aje, lazima upige kazi na enjoy maisha!",
    "sherehe": "Sherehe iko fiti sana, unataka kuja?",
    "kiende": "Kiende, bro! Life ni safari, enjoy the ride!",
    "form ni gani": "huskii sina form 😂🫴",
    "manze": "jooh, manze mambo ni mengi 😂🫴",
    "niko radar": "Niko radar, kila kitu kiko poa!"
};

const positiveResponses = ["yes", "yap", "eeh", "tuma", "tuma link", "eeh tuma link", "tuma mkuu", "eeh nko ready"];
const declineResponses = ["zae", "zii", "siko ready"];
const paymentResponses = ["nko na 50 mkuu", "nko na 60 mkuu", "nko na 60", "nko na 50"];
const postponeResponses = ["payment after serving", "eka kwanza", "eka bot kwanza"];

const shengAI = async (Matrix, m) => {
    const prefix = config.PREFIX;
    const body = m.body || "";
    const text = body.toLowerCase().trim();
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : "";
    const sender = m.sender;

    // Helper function ya kutuma ujumbe na JID ya Newsletter
    const sendSheng = async (txt) => {
        await Matrix.sendMessage(m.from, {
            text: txt,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363406146813524@newsletter',
                    newsletterName: "TIMNASA TMD • SHENG AI",
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    };

    // 1. COMMAND HANDLER (.sheng on/off)
    if (cmd === 'sheng') {
        const isOwner = config.OWNER.includes(m.sender.split('@')[0]) || m.isOwner;
        if (!isOwner) return m.reply("*⚠️ ACCESS DENIED:* This command is for my *Owner* only.");

        const args = body.slice(prefix.length + cmd.length).trim().toLowerCase();
        if (args === 'on') {
            shengMode.enabled = true;
            return m.reply("✅ *SHENG AI ACTIVATED!* Mkuu ndo kurudi kazini😂🫴");
        } else if (args === 'off') {
            shengMode.enabled = false;
            return m.reply("🚫 *SHENG AI DEACTIVATED!* Nime chill sasa mkuu.");
        } else {
            return m.reply(`*TIMNASA SHENG AI STATUS*\n\nStatus: ${shengMode.enabled ? '🟢 ON' : '🔴 OFF'}\nUse: ${prefix}sheng on/off`);
        }
    }

    // 2. AUTO-CHAT LOGIC
    // Inafanya kazi TU kama shengMode imewashwa na siyo kwenye Group
    if (!shengMode.enabled || m.isGroup) return;

    // Logic ya mtiririko wa maongezi (Conversation Flow)
    if (triggerWords.includes(text)) {
        await sendSheng("Yooh semaje mzee, unadai bot ama?");
        shengMode.users[sender] = "waitingForYes";
        return;
    }

    if (shengMode.users[sender] === "waitingForYes" && positiveResponses.includes(text)) {
        await sendSheng("Naeka na 80 mkuu, uko ready nitume link?");
        shengMode.users[sender] = "waitingForConfirm";
        return;
    }

    if (shengMode.users[sender] === "waitingForConfirm" && declineResponses.includes(text)) {
        await sendSheng("Haina noma mkuu, tutacheki baadaye.");
        delete shengMode.users[sender];
        return;
    }

    if (shengMode.users[sender] === "waitingForConfirm" && paymentResponses.includes(text)) {
        await sendSheng("Ok poa mkuu, tuma kwa hii number 0743982206 kisha nitumie screenshot nikupe kila kitu.");
        delete shengMode.users[sender];
        return;
    }

    if (shengMode.users[sender] === "waitingForConfirm" && postponeResponses.includes(text)) {
        await sendSheng("Ok mkuu, haina noma tutaongea.");
        delete shengMode.users[sender];
        return;
    }

    if (shengMode.users[sender] === "waitingForConfirm" && positiveResponses.includes(text)) {
        await sendSheng("✅ Ndo hii mkuu, pair then tuma session ID:\nhttps://projext-session-server-a9643bc1be6b.herokuapp.com/");
        delete shengMode.users[sender];
        return;
    }

    // Simple keyword matching kwa maneno mengine ya Sheng
    for (const key in shengReplies) {
        if (text.includes(key)) {
            await sendSheng(shengReplies[key]);
            return;
        }
    }
};

// Metadata kwa ajili ya Menu yako
shengAI.cmd = "sheng";
shengAI.category = "ai";

export default shengAI;
