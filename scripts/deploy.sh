# deploy.sh <bearer> <artifacturl>

cd ..;

screen -XS lennon quit;

rm -r dist;

curl \
  -o artifact.zip \
  -H "Accept: application/vnd.github+json" \ 
  -H "Authorization: Bearer $($1)" \
  $2;

unzip -q -o artifact.zip;
rm artifact.zip;

screen -dmS lennon pnpm run deploy;