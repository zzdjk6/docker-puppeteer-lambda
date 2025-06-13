# docker-puppeteer-lambda

This project demonstrates how to set up a container-based lambda on AWS with Amazon Linux 2023 and latest Chrome version driven by puppeteer.

## Run it locally

```shell
sam build && sam local invoke HelloWorldFunction
```

## Deploy to AWS and run it

```shell
# Build and deploy
sam build && sam deploy

# Invoke lambda
aws lambda invoke --function-name <YOUR_FUNCTION_NAME_HERE> response.json

# View logs
sam logs HelloWorldFunction

# Download generated PDF from S3
aws s3 cp s3://docker-puppeteer-lambda-pdf/<YOUR_FILE_NAME> ./sample.pdf
```

## References

- Latest chrome versions: https://googlechromelabs.github.io/chrome-for-testing/
- Puppeteer supported chrome versions: https://pptr.dev/supported-browsers
- Headless chrome and selenium on container image on AWS Lambda: https://github.com/umihico/docker-selenium-lambda