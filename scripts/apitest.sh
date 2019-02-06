#!/bin/bash

address=
path=
payload=

defaultAddress="1EauidThcsXuEAXoWxT3DG5D9Y8KvM2CDs"

function addressInput {
    echo -n "Enter address [press Enter to use default] > "
    read address
    if [ -z "$address" ]; then
        address=$defaultAddress
    fi
}

function sendPOST {
    postcurl="curl -v http://localhost:8000/${path} -H 'Content-Type: application/json' -H 'cache-control: no-cache' -d '${payload}'| jq"
    printf "\nExecuting:\n$postcurl\n\n"
    eval $postcurl
    printf "\n"
}

function sendGET {
    getcurl="curl -v http://localhost:8000/${path} | jq"
    printf "\nExecuting:\n$getcurl\n\n"
    eval $getcurl
    printf "\n"
}

function requestValidation {
    addressInput

    payload="{\"address\":\"${address}\"}"
    path="requestValidation"
    sendPOST
}

function validateSignature {
    addressInput
    signature=

    echo -n "Enter signature > "
    read signature
    
    payload="{\"address\":\"${address}\", \"signature\":\"${signature}\"}"
    path="message-signature/validate"

    sendPOST
}

function registerStar {
    addressInput
    star=

    echo -n "Enter star data [press Enter to use default value] > "
    read star
    if [ -z "$star" ]; then 
        star="{\"dec\": \"68° 52 56.9\",\"ra\":\"16h 29m 1.0s\",\"story\":\"Found star using https://www.google.com/sky/\"}"
    fi

    payload="{\"address\":\"${address}\", \"star\":${star}}"
    path="block"
    sendPOST
}

function getStarByHash {
    hash=
    echo -n "Enter block hash > "
    read hash
    path="stars/hash:${hash}"
    sendGET
}

function getStarByAddress {
    addressInput
    path="stars/address:${address}"
    sendGET
}

function getStarByBlockHeigh {
    height=
    echo -n "Enter block height > "
    read height
    path="block/${height}"
    sendGET
}

function getBlockchainStatus {
    path="status"
    sendGET
}

printf "Requests: \n"
options=(
    "Request validation"
    "Validate signature"
    "Register star"
    "Get block by block hash"
    "Get block by wallet address"
    "Get block by block height"
    "Get blockchain status")

select opt in "${options[@]}" "Quit"; do
    case "$REPLY" in
        7) getBlockchainStatus  ;;
        6) getStarByBlockHeigh  ;;
        5) getStarByAddress ;;
        4) getStarByHash  ;;
        3) registerStar  ;;
        2) validateSignature  ;;
        1) requestValidation  ;;
        *) break  ;;
    esac
done
