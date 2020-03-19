if [ $CODEBUILD_BUILD_SUCCEEDING -eq 1 ]
then
  VERSION=`jq .version package.json`
  REACT_APP_ENV=`echo ${REACT_APP_ENV} | tr [a-z] [A-Z]`
  echo "s3://$S3"
  aws s3 sync --delete --cache-control max-age=2592000,public umd/ s3://$S3/$VERSION
  aws cloudfront create-invalidation --distribution-id $CLOUDFRONT --paths "/*"
fi
