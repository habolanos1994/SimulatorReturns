const https = require('https');
const fs = require('fs');
const path = require('path');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;  // Temporarily disable SSL certificate verification

const libs = {
  css: [
    'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
    'https://cdn.datatables.net/1.10.20/css/jquery.dataTables.css'
  ],
  js: [
    'https://code.jquery.com/jquery-3.5.1.min.js',
    'https://cdn.datatables.net/1.10.20/js/jquery.dataTables.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.bundle.min.js'
  ]
};

for (let type in libs) {
  for (let url of libs[type]) {
    let file = path.basename(url);
    let fileStream = fs.createWriteStream(path.join(__dirname, 'lib', 'HTML', type, file));
    https.get(url, (res) => {
      res.pipe(fileStream);
    })
    .on('error', (err) => {
      console.error(`Error downloading ${file}: ${err.message}`);
    });
  }
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 1;  // Re-enable SSL certificate verification
