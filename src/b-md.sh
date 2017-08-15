#!/usr/bin/env bash

rm -rf ./dist
mkdir -p dist/md-html
cp -a ./asset ./dist
cp -a ./md ./dist

tpl=$(cat ./tpl/md.tpl.html)

for file in ./md/*
do 
  content=$(cat ${file})
  mdHtml=${tpl}
  filename=$(basename ${file})

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

  echo ${mdHtml} > ./dist/md-html/$(basename ${file} .md).html
done

rsync -avz -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress /Users/cls/Dev/Git/personal/infinitely/html/resource_management/src/dist/* root@182.61.35.147:/var/serveV2/resource/
