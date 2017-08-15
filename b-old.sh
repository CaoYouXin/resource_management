#!/usr/bin/env bash

versionCfgFile="version.cfg"

if [ -e ${versionCfgFile} ]; then
	version=$(cat ${versionCfgFile})
	echo last version is ${version}
else
	version=0
	echo ${versionCfgFile} file not exits
fi

version=$(expr ${version} + 1)

comment="resource manager v1.1.$version"

cd old-src \
    && ng build --env=prod \
    && cd .. \
    && rm -rf ./docs/ \
    && git checkout -- docs/CNAME \
    && cp -r ./old-src/dist/ ./docs/ \
    && git add --all \
    && git commit -m "$comment" \
    && git push origin master

