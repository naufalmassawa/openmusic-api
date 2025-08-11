const { default: autoBind } = require('auto-bind');
const config = require('../../utils/config');

class UploadsHandler {
  constructor(service, albumsService, validator) {
    this._service = service;
    this._albumsService = albumsService;
    this._validator = validator;

    autoBind(this);
  }

  async postUploadAlbumCoverHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    this._validator.validateAlbumCoverHeaders(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);

    const coverUrl = `http://${config.app.host}:${config.app.port}/upload/covers/${filename}`;

    await this._albumsService.updateAlbumCoverUrlById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Cover album berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
