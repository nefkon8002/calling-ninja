import pkg from '../../package.json';

export const environment = {
  production: true,
  NAME: pkg.name,
  VERSION: pkg.version,
  // REST_USER: 'http://api.user.plusnetwork.cloud:8081',
  REST_CORE: 'http://localhost:8082',
  REST_CUSTOMER_SUPPORT: 'http://localhost:8083',
  // REST_FASTAPI: 'https://api.caller.plusnetwork.cloud:8000',
  // REST_FASTAPI: 'http://api.caller.plusnetwork.cloud:8000',
  // REST_USER: 'http://api.user.plusnetwork.cloud/:8081',
  REST_FASTAPI: 'http://api.caller.callingninja.com',
  REST_USER: 'http://api.user.callingninja.com',
  USER_A: '6666660000',
  USER_P: '6'







};
