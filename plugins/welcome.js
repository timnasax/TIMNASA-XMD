// Command ya kudhibiti Anti-Link
const command = text.toLowerCase();

if (command === prefix + 'antilink on') {
    if (!isGroup) return reply('Amri hii ni kwa ajili ya magroup tu!');
    if (!isBotAdmin) return reply('Bot lazima iwe Admin ili kuzuia link!');
    if (!isAdmin) return reply('Wewe siyo Admin!');
    
    config.ANTI_LINK = true; // Inawasha kwenye config
    await reply("✅ *Anti-Link imewashwa!* Bot sasa itafuta link zote za kualika watu.");
} 

else if (command === prefix + 'antilink off') {
    if (!isGroup) return reply('Amri hii ni kwa ajili ya magroup tu!');
    if (!isAdmin) return reply('Wewe siyo Admin!');
    
    config.ANTI_LINK = false; // Inazima
    await reply("❌ *Anti-Link imezimwa.*");
}
