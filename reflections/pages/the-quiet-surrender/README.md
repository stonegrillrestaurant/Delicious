# The Quiet Surrender

Published page: https://stonegrillresto.net/reflections/pages/the-quiet-surrender/
Author: Ninox Antolihao

## Folder
- index.html: canonical reflection with SEO, Open Graph, Twitter metadata, Article structured data, existing AdSense/Analytics and comments.
- read.html: compatibility redirect for previously shared links.
- cover.jpg: 3000 × 3000 RGB JPEG podcast/social artwork, resized from generated original.
- cover-web.jpg: optimized 960 × 960 page artwork.
- rss.xml: article RSS, already contains the written reflection.
- podcast.xml: podcast RSS channel prepared for Spotify and podcast directories; currently has no episodes.
- audio.json: pending recording manifest.
- the-quiet-surrender.mp3: reserved filename only. No empty or fake audio file is created.

## When the author supplies the finished MP3
1. Save the actual recording as the-quiet-surrender.mp3 in this folder.
2. Measure the actual byte length and duration (ffprobe); use the real publication date.
3. Add one item to podcast.xml with title, description, link, stable GUID the-quiet-surrender-audio-v1, pubDate, itunes:image, itunes:duration, itunes:explicit false, itunes:episodeType full, and an enclosure with the absolute MP3 URL, actual byte length, and type audio/mpeg.
4. Add the same audio item to /reflections/rss.xml, retaining all existing episodes and the same GUID. That is the established Solitude Reflections show feed; do not replace it with this individual reflection feed.
5. Set audio.json status to published, and fill durationSeconds, byteLength and publishedAt. The page will show the real audio player only then.
6. Add the recording to this reflection's tracks array in /reflections/index.html and add an AudioObject to index.html structured data with the actual audio URL and duration.
7. Validate both XML feeds, HTTPS audio playback and byte-range support. Publish all related changes together.

A prepared XML file is not Spotify distribution. No Spotify submission or episode publication has occurred.
The comments ID intentionally retains the old /read.html path to preserve existing discussion.

## Artwork
Built-in image generation. Prompt: square editorial cover, ancient cathedral arches dissolving into a modern medical corridor; charcoal, antique gold and ivory; title “THE QUIET SURRENDER”, imprint “SOLITUDE REFLECTIONS”, subtitle “Faith, Science & Institutional Survival”, author “NINOX ANTOLIHAO”; no portraits or news-photo claims.
