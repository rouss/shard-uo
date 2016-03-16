#! bash

echo "Generating certificates for all configuration files found in ./config"
echo "All certificates must be updated every 90 days!"

echo
echo
echo "WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING"
echo
echo "This will overwrite all existing shard certificates. Type YES to continue."
echo
echo "WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING"
echo
read response
if [[ $response != "YES" ]]; then
    echo "Aborting"
    exit 0;
fi

echo

if [[ -e /usr/local/ssl/openssl.cnf ]]; then
    export OPENSSL_CONF=/usr/local/ssl/openssl.cnf
elif [[ -e /usr/ssl/openssl.cnf ]]; then
    export OPENSSL_CONF=/usr/ssl/openssl.cnf
else
    echo "Error: Unable to find openssl.cnf"
    exit 1;
fi

rm -rf certs/auth_cnc certs/shards 2>/dev/null
mkdir -p certs/auth_cnc 2>/dev/null
mkdir -p certs/shards

for fname in config/*.js; do
    fname="${fname%*.js}"
    fname="${fname#config/}"
    if [[ $fname == "example" ]]; then
        continue
    fi
    echo "$fname..."
#    openssl req \
#        -new \
#        -newkey rsa:4096 \
#        -days 365 \
#        -nodes \
#        -x509 \
#        -subj '//C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.org' \
#        -keyout "certs/$fname.key.pem" \
#        -out "certs/$fname.pem" >/dev/null 2>/dev/null
#    openssl x509 -pubkey -noout -in "certs/$fname.pem" > "certs/trusted/cnc/$fname.pub"
    ssh-keygen -q -b 2048 -t rsa -N "" -f "certs/shards/$fname"
    cp "certs/shards/$fname.pub" "certs/auth_cnc"
done
