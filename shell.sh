#! bash

# Conveniance script for creating key pairs and starting an SSH session with a
# running local instance of the server for development.

if (( $# != 1 )); then
    echo "Usage: ./shell.sh name"
    echo "  Starts an SSH shell session with the named shard instance"
    exit 0
fi

shard="$1"

user="$(whoami)"
user="${user##*\\}"

mkdir -p certs/users 2>/dev/null
mkdir -p certs/auth_shell 2> /dev/null

if ! [[ -e "certs/users/$user" ]]; then
    echo "Generating RSA key for user $user"
    ssh-keygen -q -b 2048 -t rsa -N "" -f "certs/users/$user"
    cp "certs/users/$user.pub" "certs/auth_shell"
fi

tmp=$(mktemp)
node start "$shard" -p > $tmp
exec 3<> $tmp
while read -u 3 key value; do
    if [[ "$key" == "endpoints.shell.host" ]]; then
        host="$value"
    elif [[ "$key" == "endpoints.shell.port" ]]; then
        port="$value"
    fi
done

if [[ -z "$host" || -z "$port" ]]; then
    echo "Failed to locate the SSH endpoint host and port config"
    exit 1
fi

ssh -i "certs/users/$user" -p "$port" "$user@$host"
