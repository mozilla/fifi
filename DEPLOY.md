1) have your AWS credentials in ~/.aws/config (as per http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

2) to deploy to staging:
  cd www
  aws s3 cp --recursive . s3://fifi.mofostaging.net

