export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Content-Type', 'application/json');
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({
      status: false,
      creator: "AngelaImut",
      message: "Mana URL-nya Bos? Contoh: /api/tiktok?url=https://vt.tiktok.com/..."
    });
  }
  const BASE = 'https://tikdownloader.io';
  const API_URL = `${BASE}/api/ajaxSearch`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': BASE,
    'Referer': BASE + '/',
    'X-Requested-With': 'XMLHttpRequest'
  };
  try {
    const bodyData = new URLSearchParams();
    bodyData.append('q', url);
    bodyData.append('lang', 'en');
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: headers,
      body: bodyData
    });
    const json = await response.json();
    if (json.status !== 'ok') {
      return res.json({
        status: false,
        msg: "Gagal mengambil data. Pastikan link TikTok valid/tidak diprivate."
      });
    }
    const html = json.data;
    let title = "Tanpa Judul";
    const titleMatch = html.match(/<h3>(.*?)<\/h3>/);
    if (titleMatch) title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    let thumbnail = null;
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) thumbnail = imgMatch[1];
  // C. Ambil Link Download (MP4 & MP3)
  const downloads = [];
  // Pecah HTML berdasarkan tag <a> (Link)
  const parts = html.split('<a href="');
  // Loop mulai dari 1 (karena 0 itu sampah header)
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const linkUrl = part.split('"')[0]; // Ambil URL
    // Cek Label Tombolnya (Download Video / MP3)
    // Biasanya ada di dalam class="tik-button-dl ..."
    // Kita cari teks bersihnya
    let type = "Video";
    if (part.includes('MP3')) type = "Audio (MP3)";
    else if (part.includes('Render')) continue; // Skip tombol render sampah
    // Pastikan link valid (bukan javascript:void atau link kosong)
    if (linkUrl && linkUrl.startsWith('http')) {
      downloads.push({
        type: type,
        url: linkUrl
      });
    }
  }
  // 6. HASIL AKHIR
  return res.status(200).json({
    status: true,
    author: "AngelaImut",
    result: {
      title: title,
      thumbnail: thumbnail,
      downloads: downloads
    }
  });
} catch (e) {
  return res.status(500).json({
    status: false,
    error: "Server Error: " + e.message
  });
}
}
