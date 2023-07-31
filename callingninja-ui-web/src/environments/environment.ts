// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import pkg from '../../package.json';

export const environment = {
  production: false,
  NAME: pkg.name,
  VERSION: pkg.version,
  // REST_USER: 'http://localhost:8088',

  //REST_USER: 'https://api.user.plusnetwork.cloud:8088',
  REST_CORE: 'http://localhost:8082',
  REST_CUSTOMER_SUPPORT: 'http://localhost:8083',
  REST_FASTAPI: 'https://callingninja-api-fastapi:8000',
  REST_USER: 'https://callingninja-api-user:8081',

  // REST_FASTAPI: 'http://api.caller.plusnetwork.cloud',
  // REST_USER: 'http://api.user.plusnetwork.cloud',
  //REST_FASTAPI: 'http://api.caller.callingninja.xyz',
  //REST_USER: 'http://api.user.callingninja.xyz',
  // REST_FASTAPI: 'http://api.caller.callingninja.com',
  // REST_USER: 'http://api.user.callingninja.com',

  USER_A: '6666660000',
  USER_P: '6'

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

