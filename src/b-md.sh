#!/usr/bin/env bash

rm -rf ./dist \
  && mkdir -p dist/md-html \
  && mkdir -p dist/md \
  && cp -a ./asset ./dist

tpl="$(cat ./tpl/md.tpl.html)"

for file in ./md/*
do 
  mdHtml=${tpl}
  content="$(cat ${file})"
  filename=$(basename ${file})

  re='(.*){{pub}}(.*)'
  if [[ ${content} =~ ${re} ]]; then
    echo "${BASH_REMATCH[1]}${BASH_REMATCH[2]}" > ./dist/md/${filename}
  else
    continue
    # echo "${content}" > ./dist/md/${filename}
  fi

  re='(.*){{asset-root}}(.*)'
  while [[ ${mdHtml} =~ ${re} ]]; do
    mdHtml=${BASH_REMATCH[1]}http://server.caols.tech:9999/serve${BASH_REMATCH[2]}
  done

  re='(.*){{text-content}}(.*)'
  while [[ ${mdHtml} =~ ${re} ]]; do
    mdHtml=${BASH_REMATCH[1]}${content}${BASH_REMATCH[2]}
  done

  re='(.*){{md-path}}(.*)'
  while [[ ${mdHtml} =~ ${re} ]]; do
    mdHtml=${BASH_REMATCH[1]}http://server.caols.tech:9999/serve/md/${filename}${BASH_REMATCH[2]}
  done

  re='(.*){{html-title}}(.*)'
  while [[ ${mdHtml} =~ ${re} ]]; do
    mdHtml=${BASH_REMATCH[1]}${filename}' PoweredBy showdown v1.7.2'${BASH_REMATCH[2]}
  done

  echo "${mdHtml}" > ./dist/md-html/$(basename ${file} .md).html
done

for file in ./html/*
do
  filename=$(basename ${file})
  
  if [ -d ./html/${filename}/dist ]; then
    continue
  fi

  cd ./html/${filename}
  cnpm run build
  cd ../..
  mkdir -p ./dist/html/${filename}
  cp -a ./html/${filename}/dist/* ./dist/html/${filename}

  content="$(cat ./dist/html/${filename}/index.html)"
  re='(.*){{asset-root}}(.*)'
  while [[ ${content} =~ ${re} ]]; do
    content=${BASH_REMATCH[1]}http://server.caols.tech:9999/serve${BASH_REMATCH[2]}
  done

  echo "${content}" > ./dist/html/${filename}/index.html

done

rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress /Users/cls/Dev/Git/personal/infinitely/html/resource_management/src/dist/* root@182.61.35.147:/var/serveV2/resource/
