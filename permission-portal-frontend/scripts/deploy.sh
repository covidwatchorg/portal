#! /bin/bash

# GITHUB_REF is the branch that triggered the action
# It is only set when the action is triggered on a push
if [[ ${GITHUB_REF##*/} == "prod" ]]; then
    # Note: we don't have a prod branch set up so we should never satisfy the if statment above.  We can change the cloudfront id for prod once we have that bucket/branch
  BUCKETNAME=permissions
  CLOUDFRONT_INVALIDATION_ID=E2G74JWOQDFFTX
else
  BUCKETNAME=permissions-staging
  CLOUDFRONT_INVALIDATION_ID=E2G74JWOQDFFTX
fi

echo
echo Deploying to $BUCKETNAME
echo

FOLDERNAME=dist
S3_BUCKET_URI="s3://$BUCKETNAME"

aws s3 cp index.html $S3_BUCKET_URI  --acl public-read --cache-control max-age=31557600,public --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z 

aws s3 sync $FOLDERNAME "$S3_BUCKET_URI/$FOLDERNAME" --acl public-read --cache-control max-age=31557600,public --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z


aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_INVALIDATION_ID \
    --invalidation-batch "{\"Paths\": {\"Items\": [\"/*\"], \"Quantity\": 1}, \"CallerReference\":\"`date`\"}" > /dev/null

echo
echo Done deploying
echo



