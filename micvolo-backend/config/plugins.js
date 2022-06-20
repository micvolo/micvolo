const prodUpload = (env) => ({
  config: {
    provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
    providerOptions: {
      bucketName: 'micvolo-uploads',
      publicFiles: true,
      uniform: false,
      basePath: '',
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
        "private_key_id": "9780c2a9ce6ca6a9f4f69d06d57146d77672dd24",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCUHPP0t9POGslO\nf15/EPVulgehvkFU/qWr9PSbyprLSz9q8UKZmSPTvUxtPk2cqQAbPHuFgOMXiDmA\nDUFdr6Gp+QdMjrEJRsg/J2cV0sUr5wawOMqDx8JhCzXJQSzthR1ejk03+2pwK7mo\nJJZSiNiO+aTaFzTO+KcQ6WLW/2n9GdUKmZfDnjQi1St9GDBw/IyPMx40DzhRNZv+\nnMRZFFs5+zuquC90IkqSmqR3Ti9QDcyPw4JIP+9Fzs+3YIa7JOARHZJhzk248SVi\nd+BidfQfroDdglJbLgfoYZgn1yifhJSIR49hRgxi9OMZ4gu+mbpaxyh7RkY/NYuE\nInvvnv/zAgMBAAECggEACsaQeR1mq3gHbU6W8Weqc4E2zO2qkyRzqS8JHMyAtomi\n84TZ85LQqHb9OHVv8BXbjB+6XNwjqXKfvFE6kDZW7KbRgSBggOxFZVLYjR3oemk0\nc12uXigKXEUUhK/ZNO6aVGbF92yzMbX8q979kMOj/cLr23IUxXoRrYlNR5cNfvxl\nx2bAsFA74G1WBDIpgyf34SEsC3Mz2SPbF/VgHY2cE/mGUSz8hILsRBIuosmTU2xK\nScfmhV8AteJrDx1XGNqngxfmX0YPjv2cflVb70TxH0Epdl6ULmPzZDQb8fWeNbuS\nsE2Pt6+iBvmzJYWlMINQGMXRkj+mPQr+VPYDl1WAAQKBgQDLQeIKrd/EMIWBhTur\nDIhT58Z9AWNBwqr6BWyr01hMIVvBkNWx3eSEmymiWyVSy8jLMvDU5sAS5nAGwqnr\nwKtf1vETkBVvKCmJzc6VdzxQ+x1rZhctH7jwNa2wMmhyqcZzlfaUXFEbbB0Rt9V/\n4SGIP9yna2lBGom06LxHqN6Z8wKBgQC6i+jxNzKdcPUd2+6vM2h2BJNwabEnuDjL\nbtqdhP9oWnhEQ80jThw6bFti6sCWPCEMNFRhEitYrISIca9mPj8Qq5nyaD/N+ODD\nULIw5gYSmGrRMkMP6yDPGWMlfDiUtMm0ETqk1OJhJXYzW5BEO4J4wh1+DTh73wVt\nzdm32uGCAQKBgGLzWvj59sLLIGOSmh7GhiPa5Q18PHcKLzRyqZno1MaTQtk0CmSB\n8rr/0sAAgWYSYVlTHl13TLCm0IjqAdEMxiFtQYXVkinAMqCsudKX7pw58/OSCtxj\n4iPG7hymHaUcs8kXi6hkXPPtqSU0CtMrpahv9prmtqIEKmARIX/9XQkzAoGAJL3h\nx4DDq1bQMG1c+Yz6iiQklgN7LQOPzCGtVVEYrQkEnw1rngSIcslcxoLOI8j8CVdV\nNzlI6FIyWF1r2otwCGyECcaWqo7WViHStubXU1pJz6JCqyP4dlHdwUhSLJffEmRC\nVKzJWbDzMvJZ29aMwBQbkvQvp9YpT5M3yoqF2AECgYAuQmdfo5iHu/j69ULC78I+\nVMYPQ4vr0hnKMtEKMwrc/JC4nI2iGCnvGNnTMpUTXECzwjy4xYTDfjpOqcftGmZr\naKYxUV7s/pjr+eiTm8u69uU5U6r67LQMq/E22P6o/vqq0r60SwgPu5zXyztdpCvB\nU/wLkimrpohakvDXgvdqAA==\n-----END PRIVATE KEY-----\n",
        "client_email": "local-cloud-storage@micvolo-5b784.iam.gserviceaccount.com",
        "client_id": "114498996175106358284",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/local-cloud-storage%40micvolo-5b784.iam.gserviceaccount.com"
      },
      baseUrl: 'https://storage.googleapis.com/{bucket-name}',
      basePath: '',
    },
  },
})

module.exports = ({env}) => ({
  upload: env('NODE_ENV') === 'development' ? devUpload(env) : prodUpload(env)
});
