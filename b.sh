#!/usr/bin/env bash

ng build --env=prod -base /resources/ \
    && rm -rf ./docs/ \
    && cp -r ./dist/ ./docs/
#    && git checkout -- docs/CNAME \
