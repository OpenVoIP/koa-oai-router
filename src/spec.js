import { statSync } from 'fs';
import swaggerParser from 'swagger-parser';

import { bundle } from './util/spec-bundle';

const colors = require('colors/safe');
/**
 * Load and parse specification from apiDir. support json or yaml.
 * @param {string} apiDir
 * @returns {Promise}
 */
function parse(apiDir, logger) {
  return swaggerParser.validate(apiDir, { validate: { schema: true, spec: true } })
    .then((api) => {
      // terminal 显示 api 接口
      if (logger) {
        logger.info(`api title: ${colors.gray(api.info.title)} version: ${colors.gray(api.info.version)}`);
        Object.keys(api.paths).forEach((path) => {
          let method;
          switch (Object.keys(api.paths[path])[0]) {
            case 'get':
              method = colors.green('get  ');
              break;
            case 'post':
              method = colors.yellow('post ');
              break;
            default:
              method = colors.red(Object.keys(api.paths[path])[0]);
          }
          logger.info(`${method}   ${path}`);
        });
      }
      return api;
    });
}

/**
 * Load openapi specification to json object from api path or api directory.
 * @param {string} api
 * @returns {object}
 */
async function load(api, logger) {
  if (Array.isArray(api)) {
    return Promise.all(api.map((item) => {
      return load(item, logger);
    }));
  }

  const stat = statSync(api);
  if (stat.isFile()) {
    return parse(api, logger);
  } else if (stat.isDirectory()) {
    return parse(bundle(api), logger);
  }

  throw new Error('Not support api!');
}

export default load;
