import { Message } from "discord.js";
import Event from "../../structures/Event";
import { Lavamusic } from "../../structures/index";

export default class EmbedFixer extends Event {
    constructor(client: Lavamusic, file: string) {
        super(client, file, {
            name: "messageCreate",
            description: "Social Media Embed Fixer", // Menambahkan deskripsi opsional untuk dokumentasi
            type: "client" // FIX: Menambahkan tipe event 'client' yang diperlukan oleh versi terbaru Lavamusic
        });
    }

    public async run(message: Message): Promise<void> {
        // Abaikan pesan dari bot
        if (message.author.bot) return;
        // Pastikan pesan ada di TextChannel (bukan DM)
        if (!message.inGuild()) return;

        let originalContent = message.content;
        let newContent = originalContent;
        
        interface LinkFix {
            type: string;
            original: string;
            fixed: string;
        }
        
        let linksToFix: LinkFix[] = [];

        // --- Definisi Regex ---
        const instagramRegex = /https?:\/\/(www\.)?instagram\.com\/\S+/g;
        const twitterRegex = /https?:\/\/(www\.)?(twitter|x)\.com\/\S+/g;
        const tiktokRegex = /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/\S+/g;
        const facebookRegex = /https?:\/\/(www\.|m\.|web\.)?facebook\.com\/\S+/g;
        const pixivRegex = /https?:\/\/www\.pixiv\.net\/\S+/g;

        // --- 1. Deteksi Link Instagram (kkinstagram) ---
        let igMatches;
        while ((igMatches = instagramRegex.exec(originalContent)) !== null) {
            // Hindari replace jika sudah benar
            if (!igMatches[0].includes('kkinstagram')) {
                linksToFix.push({
                    type: 'Instagram',
                    original: igMatches[0],
                    fixed: igMatches[0].replace('instagram.com', 'kkinstagram.com')
                });
            }
        }

        // --- 2. Deteksi Link Twitter/X (fxtwitter) ---
        let twMatches;
        while ((twMatches = twitterRegex.exec(originalContent)) !== null) {
            if (!twMatches[0].includes('fxtwitter')) {
                linksToFix.push({
                    type: 'Twitter/X',
                    original: twMatches[0],
                    fixed: twMatches[0].replace(/(twitter|x)\.com/, 'fxtwitter.com')
                });
            }
        }

        // --- 3. Deteksi Link TikTok (tiktokez) ---
        let ttMatches;
        while ((ttMatches = tiktokRegex.exec(originalContent)) !== null) {
            if (!ttMatches[0].includes('tiktokez')) {
                linksToFix.push({
                    type: 'TikTok',
                    original: ttMatches[0],
                    fixed: ttMatches[0].replace('tiktok.com', 'tiktokez.com')
                });
            }
        }

        // --- 4. Deteksi Link Facebook (facebed) ---
        let fbMatches;
        while ((fbMatches = facebookRegex.exec(originalContent)) !== null) {
            if (!fbMatches[0].includes('facebed')) {
                linksToFix.push({
                    type: 'Facebook',
                    original: fbMatches[0],
                    fixed: fbMatches[0].replace('facebook.com', 'facebed.com')
                });
            }
        }

        // --- 5. Deteksi Link Pixiv (phixiv) ---
        let pixivMatches;
        while ((pixivMatches = pixivRegex.exec(originalContent)) !== null) {
            if (!pixivMatches[0].includes('phixiv')) {
                linksToFix.push({
                    type: 'Pixiv',
                    original: pixivMatches[0],
                    fixed: pixivMatches[0].replace('pixiv.net', 'phixiv.net')
                });
            }
        }

        // --- Eksekusi Fixer ---
        if (linksToFix.length > 0) {
            // Ganti link di pesan asli dengan format [Type Link](url)
            linksToFix.forEach((link, index) => {
                // Buat label link (misal: "Instagram Link 1")
                const linkText = linksToFix.length > 1 ? `${link.type} Link ${index + 1}` : `${link.type} Link`;
                // Ganti URL asli dengan format Markdown [Label](URL Baru)
                newContent = newContent.replace(link.original, `[${linkText}](${link.fixed})`);
            });

            try {
                // Kirim pesan baru
                await message.channel.send({
                    content: `Pesan dari ${message.author}:\n\n> ${newContent}`,
                    allowedMentions: { repliedUser: false, parse: [] }
                });

                // Hapus pesan asli jika bot punya izin
                if (message.deletable) {
                    await message.delete().catch(() => {});
                }

            } catch (err) {
                console.log("[EmbedFixer] Gagal membalas atau menghapus pesan.", err);
            }
        }
    }
}