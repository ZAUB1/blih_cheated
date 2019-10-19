if ! which node > /dev/null; then
    echo "Node isn't installed. Aborting."
    exit 1
fi

if ! which npm > /dev/null; then
    echo "Npm isn't installed. Aborting."
    exit 1
fi

if [[ $EUID -ne 0 ]]; then
    echo "You must run this with superuser priviliges.  Try \"sudo ./install.sh\"" 2>&1
    exit 1
else
    echo "Installing blih cheated..."
fi

npm install
sudo npm i -g @zeit/ncc

ncc build main.js -m -o build
sudo cp build/index.js /bin/zblih

echo "Blih cheated installed (you might have to restart your terminal)"