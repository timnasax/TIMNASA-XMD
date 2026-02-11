import axios from "axios";
import yts from "yt-search";
import config from "../config.cjs";
import moment from "moment-timezone";

const video = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body || "";
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0]?.toLowerCase() : "";
  const args = body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/).slice(1) : [];

  if (cmd !== "video") return;

  // Modern configuration for consistency
  const channelConfig = {
    newsletterJid: '120363406146813524@newsletter',
    newsletterName: "TIMNASA TMD • VIDEOS",
    serverMessageId: 143
  };

  try {
    // Dynamic Greeting
    moment.tz.setDefault("Africa/Nairobi");
    const hour = moment().hour();
    const greeting = hour < 12 ? "Good Morning! ☀️" : hour < 18 ? "Good Afternoon! 🌤️" : "Good Evening! ✨";

    // Modern Searching Message
    await gss.sendMessage(m.from, {
      text: `*${greeting}*\n\n*🎬 Processing your video request, please wait...*`,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: channelConfig,
      },
    }, { quoted: m });

    if (!args.length) {
      return gss.sendMessage(m.from, {
        text: '❌ Please provide a video name or a YouTube link.',
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: channelConfig,
        },
      }, { quoted: m });
    }

    const query = args.join(' ');
    const search = await yts(query);

    if (!search || !search.videos || !search.videos[0]) {
      return gss.sendMessage(m.from, { 
        text: '❌ No results found. Please check your spelling and try again.',
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: channelConfig,
        }
      }, { quoted: m });
    }

    const videoData = search.videos[0];
    const apiURL = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(videoData.videoId)}&format=mp4`;

    try {
      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.downloadLink) {
        throw new Error('Download link not found');
      }

      // Modern Video Information Display
      await gss.sendMessage(m.from, {
        image: { url: videoData.thumbnail },
        caption: `*🎬 VIDEO FOUND*\n\n*📌 Title:* ${videoData.title}\n*👤 Channel:* ${videoData.author.name}\n*🕒 Duration:* ${videoData.timestamp}\n*👁️ Views:* ${videoData.views.toLocaleString()}\n*📅 Uploaded:* ${videoData.ago}\n\n> *©2024 Timnasa Tmd Multimedia*`,
        contextInfo: {
          externalAdReply: {
            title: "TIMNASA TMD VIDEO PLAYER",
            body: videoData.title,
            mediaType: 1,
            thumbnailUrl: videoData.thumbnail,
            sourceUrl: videoData.url,
            renderLargerThumbnail: true,
          },
        },
      }, { quoted: m });

      // Send the Video File
      await gss.sendMessage(m.from, {
        video: { url: data.downloadLink },
        caption: `*${videoData.title}*`,
        contextInfo: {
          externalAdReply: {
            title: "NOW PLAYING",
            body: "Timnasa Tmd Video Service",
            mediaType: 1,
            thumbnailUrl: videoData.thumbnail,
            renderLargerThumbnail: false,
          },
        },
      }, { quoted: m });

    } catch (apiErr) {
      console.error('[VIDEO API ERROR]:', apiErr);
      await gss.sendMessage(m.from, { 
        text: '⚠️ The video server is currently busy. Please try again in a few minutes.',
        contextInfo: {
          isForwarded: true,
          forwardedNewsletterMessageInfo: channelConfig,
        }
      }, { quoted: m });
    }

  } catch (err) {
    console.error('[VIDEO ERROR]:', err);
    await gss.sendMessage(m.from, { text: '⚠️ An unexpected error occurred: ' + err.message });
  }
};

export default video;
