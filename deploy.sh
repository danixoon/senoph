#!/usr/bin/env bash

yarn backend:build
mkdir ./build/public

cd client && yarn build
mv ./build/* ../build/public
cd ..

zip=false
while getopts 'z' flag
do
  case "${flag}" in
    z) zip=true;;
  esac
done

rm -rf deploy
mkdir deploy

cp -r ./node_modules ./deploy
mv ./build ./deploy

echo "SET NODE_ENV=production node ./build/index.js" > ./deploy/start.bat
echo -e '#!/usr/bin/env bash\nNODE_ENV=production node ./build/index.js' > ./deploy/start.sh

cp .production.env ./deploy
cp package.json ./deploy

if $zip; then

  if [[ -e "./deploy.zip" ]]; then
    rm ./deploy.zip
  fi
  zip -r deploy.zip ./deploy
fi




# ZIP = false
