module.exports = {
  apps: [
    {
      name: 'app',
      script: '.dist/main.js',
      instances: 0,
      exec_mode: 'cluster',
    },
  ],
};
