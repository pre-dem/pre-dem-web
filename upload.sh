#!/usr/bin/env bash

if [[ -n $TRAVIS_TAG ]]; then
	wget -O qshell https://dn-devtools.qbox.me/2.1.5/qshell-linux-x64
	chmod a+x qshell
	./qshell account $ak $sk
	./qshell rput misc $(ls dist) dist/$(ls dist)
fi