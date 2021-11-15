#!/usr/bin/env bash

# Установка зависимостей
yarn backend:build
cd client && yarn build && cd ..

# Перемещение билда фронта
mkdir ./build/public
mv ./client/build/* ./build/public

# Проверка на -z флаг создания .zip архива прода
zip=false
while getopts 'z' flag
do
  case "${flag}" in
    z) zip=true;;
  esac
done

# Перемещение кода билда и зависимостей в директорию прода
rm -rf ./deploy || mkdir ./deploy
cp -r ./node_modules ./deploy
mv ./build ./deploy

# Установка флага NODE_ENV на прод
echo -e 'process.env.NODE_ENV="production";\n' | cat - ./deploy/build/index.js > temp && mv temp ./deploy/build/index.js
# Создание сценарных файлов запуска для винды/линухи
echo "node ./build/index.js" > ./deploy/start.bat
echo -e '#!/usr/bin/env bash\n node ./build/index.js' > ./deploy/start.sh

# Копирование продового шаблона env-переменных и файла списка зависимостей
cp .production.env ./deploy
cp package.json ./deploy

# Создание .zip архива прода
if $zip; then
  if [[ -e "./deploy.zip" ]]; then
    rm ./deploy.zip
  fi
  zip -r deploy.zip ./deploy
fi