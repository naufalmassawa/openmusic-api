const { default: autoBind } = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator, songsService) {
    this._service = service;
    this._validator = validator;
    this._songsService = songsService;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._service.postAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          ...album,
          songs,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.putAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(request, h) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyAlbumExists(albumId);
    await this._service.likeAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  async deleteAlbumLikeHandler(request) {
    const { id: albumId } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._service.verifyAlbumExists(albumId);
    await this._service.unlikeAlbum(userId, albumId);

    return {
      status: 'success',
      message: 'Batal menyukai album',
    };
  }

  async getAlbumLikesCountHandler(request) {
    const { id: albumId } = request.params;

    await this._service.verifyAlbumExists(albumId);

    const likes = await this._service.getAlbumLikesCount(albumId);

    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }
}

module.exports = AlbumsHandler;
