module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        bucketName: 'micvolo-uploads',
        publicFiles: false,
        uniform: false,
        basePath: '',
      },
    },
  },
});
