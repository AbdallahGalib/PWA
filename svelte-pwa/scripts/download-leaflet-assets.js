import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assets = [
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    filename: 'marker-icon.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    filename: 'marker-icon-2x.png'
  },
  {
    url: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    filename: 'marker-shadow.png'
  }
];

const targetDir = path.join(__dirname, '..', 'public', 'leaflet');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

assets.forEach(asset => {
  const file = fs.createWriteStream(path.join(targetDir, asset.filename));
  https.get(asset.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${asset.filename}`);
    });
  }).on('error', err => {
    fs.unlink(file);
    console.error(`Error downloading ${asset.filename}:`, err.message);
  });
});
