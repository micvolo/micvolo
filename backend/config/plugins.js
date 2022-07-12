const prodUpload = (env) => ({
  config: {
    provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
    providerOptions: {
      bucketName: 'micvolo-uploads',
      publicFiles: true,
      uniform: false,
    },
  },
})

const devUpload = (env) => ({
  config: {
    provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
    providerOptions: {
      bucketName: 'micvolo-uploads',
      publicFiles: true,
      uniform: false,
      serviceAccount: {
        "type": "service_account",
        "project_id": "micvolo-5b784",
        "private_key_id": "2ac81f8a93bd49f354013d0febc91d7c292d20e2",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpUAxgvSWPmnB4\nDdADRIp6vUHQrR1MiPCbUFM5GiKfluFTIL5+5FhMzum4HVbLUV9fePcewsZYa6B7\nELWtES5wT0r8fRPrpj+pyqQ+InS7AZQ2Lskio/YQ06gl/omcvJ3jR9Q7a9KmyPJw\nVM0t4i99ZuFmEqsPeMk/eeTJH9okofcOiB7MA3N/OE7F4tvQI9wEhT+NmOWfNXHS\nmKn1WzQS6K7rKDIq4p6CT1mXy/cZoHyLuxNFwBIEtBWEeZEdg9b98cNYx3g8MaZp\np7sTnWXyNYRdtk9kw9TQO2eMJCOajj/8vU66c34uGwGANbHZQAU3RnW07bCNmJbR\nnFSMuyB1AgMBAAECggEAE7BypAxS8iJyWk+25S5jETdxkCgVjGkvW8xpRS5wINFt\nthpMdNqulw4H2WiWB5JYrjRVvo7FfJJViQIuMmhZV2etL3QHLUP5ys+9LlmY7AdY\nuj1SGBRroNTQTMzPKXo4vS3E9T0Kc+lR4jTGYIPZZHKimxloKaYw9xAAhlANMO2x\nYIte+iH9y3Q+oUUkxkzaACxoC9rSq+cTKQ6a9otoyjW0BBpbtve3bLSbXPVhtD7c\nDqSwTquq6WZlduy1RdqIRQqD8X276xPChz+c0gTz4AZuF2IUYg7g8cFqzzRwddxr\n/GlIPwRtEqNQOHL/V6RDZO8d2XTEIioYnFIjXVqquQKBgQDaVoIbnV5ksbjASGor\ntjqTzoYSXhkPR6+WNr2cbhoTx0v83JWA+TS1JrfszYauCmTC5o6KJm3DABGYFs2w\nBIWnJBDSuVjHDu2o1WCDHcUevX0zT6kcs73NdSa8MZ3DlAq5ExNOUTBOezzuJBF3\noVtRwWfbhwr8Yj7WCTs4oOX5TQKBgQDGhKfVOwYaRGo7esiOQslRt1S3FxEbIrgU\n5ILNVQ7Y2EWL3OWu37AQoKB7z6l8+BIWluXyghpeoqQ5cpp26IMKb/vuJTD9YfrE\nwKeWOh/uBkNEcIp7GWE57gr8Gb7+j8A4rZzHTleqO+LXgGlllk3A4as3ZWoyE5Pn\nyKo2TFpvyQKBgQCW6vz8AYbhq0a9AlEA7fEHgdWClLBVs4NXHXdqzWARE80ed4qP\nn7IjFSRE9ruFSYHkhmE4dN+hzkZbDkgWxslrgq5uOdd3oIX+EZ+ogcdjPC9ybDnE\nsSkc/0FLDDC0o3vV+a16kPwHA4BWS3AXdN0eYcVcJLgfQ/mTEMZymiTccQKBgEPu\nPOgwbGQsqRV1bI+RtwYpb+m/EPFyLf+oOkI9Kvl0+Edl7YqrrLnj3UbAxsSmtrnY\nJROZBaEAkqW927F42u6FZ3YUb/EkyATvz+kONsLijb4rrJd3FdgW5tdhkAPX+PTs\nI8vnuQPdvj/0BxzmE/E+x7ILGA3OuTwFZIl0EzZRAoGARsDOlNfAqnPpwtlpUlbd\n7D/E3Hsdd/SocdYPxv368cM3PJIJwHaOrMmOsowdHNIheENavZHBRDbFluGY/GYw\nTg+Puy/a8sEX96t5FMR3elM/9XsTkn85TieaHktesKMw/0jd2qRbj/+Aehaw8L7q\nJxD2qRROQF5GbjuTBzVpOnk=\n-----END PRIVATE KEY-----\n",
        "client_email": "local-cloud-storage@micvolo-5b784.iam.gserviceaccount.com",
        "client_id": "102311282349122532623",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/local-cloud-storage%40micvolo-5b784.iam.gserviceaccount.com"
      }
      ,
    },
  },
})

module.exports = ({env}) => ({
  upload: env('NODE_ENV') === 'development' ? devUpload(env) : prodUpload(env)
});
