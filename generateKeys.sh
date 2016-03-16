#! bash

hexDigits=( 0 1 2 3 4 5 6 7 8 9 A B C D E F )

function makeApiKey {
    name="$1"
    
    # Generate 1024-bit API key
    key=""
    for (( i = 0; i < 256; ++i )); do
        key="$key${hexDigits[(( $RANDOM % 16 ))]}"
    done
    echo $key > "keys/$name"
}

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

rm -rf certs 2>/dev/null
rm -rf keys 2>/dev/null
mkdir certs 2>/dev/null
mkdir keys 2>/dev/null

for fname in config/*.js; do
    fname="${fname%*.js}"
    fname="${fname#config/}"
    if [[ $fname == "example" ]]; then
        continue
    fi
    
    # Generate 4096-bit RSA key and certificate
    echo -n "$fname: Generating Certificate, "
    openssl req \
        -new \
        -newkey rsa:4096 \
        -days 365 \
        -nodes \
        -x509 \
        -subj '//C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.org' \
        -keyout "certs/$fname.key.pem" \
        -out "certs/$fname.cert.pem" >/dev/null 2>/dev/null
    
    echo "API Key"
    makeApiKey "$fname"
done
