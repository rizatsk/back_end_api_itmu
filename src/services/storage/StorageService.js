const fs = require('fs');
const InvariantError = require('../../exceptions/InvariantError');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    // if (!fs.existsSync(folder)) {
    //   fs.mkdirSync(folder, {recursive: true});
    // }
  }

  writeFile(file, meta, folder) {
    const folderPerService = `${this._folder}/${folder}`;
    if (!fs.existsSync(folderPerService)) {
      fs.mkdirSync(folderPerService, {recursive: true});
    }

    const filename = meta.filename;
    const fileArray = filename.split('.');
    const indexFormatFile = fileArray.length - 1;
    const formatFile = fileArray[indexFormatFile];

    const fileName = +new Date()+`.${formatFile}`;
    const path = `${folderPerService}/${fileName}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(fileName));
    });
  }

  deleteFile(fileName, folder) {
    const path = `${this._folder}/${folder}/${fileName}`;
    if (fs.existsSync(path)) {
      fs.unlinkSync(path, (error) => {
        if (error) throw new InvariantError('Gagal menghapus file');
      });
    }
  }
}

module.exports = StorageService;
