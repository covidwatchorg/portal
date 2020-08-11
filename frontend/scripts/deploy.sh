#! /bin/bash

# GITHUB_REF is the branch that triggered the action
# It is only set when the action is triggered on a push
if [[ ${GITHUB_REF##*/} == "master" ]]; then
  BUCKETNAME=covidwatch-permissions
  CLOUDFRONT_INVALIDATION_ID=E6HKPE76CKP
else
  BUCKETNAME=permissions-staging
  CLOUDFRONT_INVALIDATION_ID=E2G74JWOQDFFTX
fi

echo
echo Deploying to $BUCKETNAME
echo

FOLDERNAME=dist
S3_BUCKET_URI="s3://$BUCKETNAME"

# Upload index.html and favicon if they've changed
diff=$(git diff --name-only HEAD HEAD~1)

if echo $diff | grep -q index.html; then  
    echo Uploading index.html
    aws s3 cp index.html $S3_BUCKET_URI  --acl public-read --cache-control max-age=31557600,public --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z --only-show-errors
fi


if echo $diff | grep -q favicon.ico; then  
    echo Uploading favicon.ico
    aws s3 cp favicon.ico $S3_BUCKET_URI  --acl public-read --cache-control max-age=31557600,public --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z --only-show-errors
fi


# Upload /dist (bundled web app)
aws s3 sync $FOLDERNAME "$S3_BUCKET_URI/$FOLDERNAME" --acl public-read --cache-control max-age=31557600,public --metadata-directive REPLACE --expires 2034-01-01T00:00:00Z --only-show-errors


aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_INVALIDATION_ID \
    --invalidation-batch "{\"Paths\": {\"Items\": [\"/*\"], \"Quantity\": 1}, \"CallerReference\":\"`date`\"}" > /dev/null

echo
echo Done deploying
echo



