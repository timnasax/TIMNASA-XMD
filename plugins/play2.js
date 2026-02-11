import axios from "axios";
import yts from "yt-search";
import config from "../config.cjs";
import moment from "moment-timezone";

const play = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase() : "";
  const args = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/).slice(1) : [];

  if (cmd !== "play2") return;

  // Modern Channel Configuration
  const channelInfo = {
    newsletterJid: '120363406146813524@newsletter',
    newsletterName: "TIMNASA TMD • PREMIUM",
    serverMessageId: 143
  };

  try {
    // Dynamic Greeting based on time
    moment.tz.setDefault("Africa/Nairobi"); 
    const hour = moment().hour();
    let greeting = hour < 12 ? "Good Morning! ☀️" : hour < 18 ? "Good Afternoon! 🌤️" : "Good Evening! ✨";

    // Initial Search Message
    await gss.sendMessage(m.from, {
      text: `*${greeting}*\n\n*🔍 Searching for your track, please wait...*`,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: channelInfo,
      },
    }, { quoted: m });

    if (!args.length) {
      return gss.sendMessage(m.from, {
        text: '❌ Please provide a song name or a YouTube link.\n\n*Example:* .play Blinding Lights',
      }, { quoted: m });
    }

    const query = args.join(' ');
    const search = await yts(query);

    if (!search || !search.videos || !search.videos[0]) {
      return gss.sendMessage(m.from, { text: '❌ Sorry, I couldn\'t find that song.' });
    }

    const video = search.videos[0];
    const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

    const response = await axios.get(apiURL);
    const data = response.data;

    if (!data.downloadLink) {
      return gss.sendMessage(m.from, { text: '❌ Failed to fetch the download link. Try again.' });
    }

    // Modern Metadata Display
    await gss.sendMessage(m.from, {
      image: { url: video.thumbnail },
      caption: `*🎵 TRACK FOUND*\n\n*🎼 Title:* ${video.title}\n*👤 Artist:* ${video.author.name}\n*🕒 Duration:* ${video.timestamp}\n*👁️ Views:* ${video.views.toLocaleString()}\n*📅 Uploaded:* ${video.ago}\n\n> *Powered by Timnasa Tmd*`,
      contextInfo: {
        externalAdReply: {
          title: "TIMNASA TMD PLAYER",
          body: `Now Playing: ${video.title}`,
          mediaType: 1,
          thumbnailUrl: video.thumbnail,
          sourceUrl: video.url,
          renderLargerThumbnail: true,
        },
      },
    }, { quoted: m });

    // Send the Audio File
    await gss.sendMessage(m.from, {
      audio: { url: data.downloadLink },
      mimetype: 'audio/mpeg',
      fileName: `${safeTitle}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: "Timnasa Tmd - High Quality Audio",
          mediaType: 1,
          thumbnailUrl: video.thumbnail,
          renderLargerThumbnail: false,
        },
      },
    }, { quoted: m });

  } catch (err) {
    console.error('[PLAY ERROR]:', err);
    await gss.sendMessage(m.from, { text: '⚠️ A technical error occurred. Please try again later.' });
  }
};

export default play;
