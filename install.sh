echo "WIP"
exit 1

if [[ $EUID -ne 0 ]]; then
    echo "You must run this with superuser priviliges.  Try \"sudo ./install.sh\"" 2>&1
    exit 1
else
    echo "Installing blih cheated..."
fi

mkdir /bin/zblih_src
cp -rf ./* /bin/zblih_src

cd /bin/zblih_src
sudo npm install

if [ -f ~/.zshrc ]; then
    sudo echo alias zblih='node /bin/zblih_src/main.js' >> ~/.zshrc
elif [ -f ~/.bashrc ]; then
    sudo echo alias zblih='node /bin/zblih_src/main.js' >> ~/.bashrc
else
    echo "No shell rc found exiting"
    exit 1
fi

sudo alias zblih="node /bin/zblih_src/main.js"

echo "Blih cheated installed (you might have to restart your terminal)"