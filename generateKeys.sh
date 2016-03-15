#! bash

echo "Generating certificates for all configuration files found in ./config"
echo "All certificates must be updated every 90 days!"

echo
echo
echo "WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING"
echo
echo "This will overwrite all existing certificates in ./certs . Do you wish"
echo "to continue? Type YES to continue."
echo
echo "WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING"
echo
read response
if [[ $response != "YES" ]]; then
    echo "Aborting"
    exit 0;
fi

if [[ -e /usr/local/ssl/openssl.cnf ]]; then
    export OPENSSL_CONF=/usr/local/ssl/openssl.cnf
elif [[ -e /usr/ssl/openssl.cnf ]]; then
    export OPENSSL_CONF=/usr/ssl/openssl.cnf
else
    echo "Error: Unable to find openssl.cnf"
    exit 1;
fi

rm -rf certs 2>/dev/null
mkdir -p certs/trusted/cnc 2>/dev/null
mkdir -p certs/trusted/shell 2>/dev/null

for fname in config/*.js; do
    fname="${fname%*.js}"
    fname="${fname#config/}"
    if [[ $fname == "example" ]]; then
        continue
    fi
    echo "$fname..."
    openssl req \
        -new \
        -newkey rsa:4096 \
        -days 365 \
        -nodes \
        -x509 \
        -subj '//C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.org' \
        -keyout "certs/$fname.key.pem" \
        -out "certs/$fname.pem" >/dev/null 2>/dev/null
    openssl x509 -pubkey -noout -in "certs/$fname.pem" > "certs/trusted/cnc/$fname.pub"
done

username="$(whoami)"
username="${username##*\\}"

if [[ -e ~/.ssh/id_rsa.pub ]]; then
    echo "Copying ~/.ssh/id_rsa.pub to ./certs/trusted/shell/$username.pub"
    cp ~/.ssh/id_rsa.pub "./certs/trusted/shell/$username.pub"
else
    echo "You have no SSH key on this system. Generate now? (YES)"
    read resp
    if [[ "$resp" -eq "YES" || -z "$resp" ]]; then
        ssh-keygen
        if ! [[ -e ~/.ssh/id_rsa.pub ]]; then
            echo "Error: cannot find ~/.ssh/id_rsa.pub"
        else
            cp ~/.ssh/id_rsa.pub "./certs/trusted/shell/$username.pub"
        fi
    fi
fi

echo "Use the name $username to connect to the SSH shell for all shards."
echo "Please remember to install trusted shell user's public keys"
echo "to ./certs/trusted/shell ."
