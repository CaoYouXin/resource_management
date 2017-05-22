#!/usr/bin/env bash

ng build --env=prod -base /resource_management/ \
    && rm -rf ./docs/ \
    && cp -r ./dist/ ./docs/
#    && git checkout -- docs/CNAME \
