require('dotenv').config();

const Hapi = require('@hapi/hapi');
const albums = require('./api/albums');
const songs = require('./api/songs');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register albums plugin
  await server.register({
    plugin: albums,
    options: {
      service: AlbumsService,
      validator: AlbumsValidator,
    },
  });

  // Register songs plugin
  await server.register({
    plugin: songs,
    options: {
      service: SongsService,
      validator: SongsValidator,
    },
  });

  // Global error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Handle custom client error
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    // Handle internal server error
    if (response.isBoom) {
      console.error(response);

      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kesalahan pada server',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
