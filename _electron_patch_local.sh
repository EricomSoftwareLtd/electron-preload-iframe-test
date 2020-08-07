#!/bin/sh -ex

get_abs_dir() {
    local d="$(\dirname ${1})"
    local f="$(\basename ${1})"
    (
        \cd ${d} >/dev/null 2>&1
        while [ -h "${f}" ]; do
            \cd $(\dirname $(\readlink ${f})) >/dev/null 2>&1
        done
        \pwd -P
    )
}

SCRIPTPATH=$(get_abs_dir "$0")

. "$SCRIPTPATH/_electron_image_tag"
cd $SCRIPTPATH
IMAGE_NAME="securebrowsing/electron-bin"

rm -rf "$SCRIPTPATH/node_modules/electron/dist" || true

docker container create --name "electron_tmp" "${IMAGE_NAME}:${ELECTRON_TAG}" - 
docker cp electron_tmp:/dist ./node_modules/electron/dist
docker container rm "electron_tmp"