# SANAD
The name is a equvelant for dns in persian(سامانه نام دامنه) 

sanad is dns changer extensions for Gnome.

### How to install
#### install from gnome extentions
- go [here](https://extensions.gnome.org/extension/7861/sanad/) and install it 
#### install from github
- download the extension zip file from the last [release]([url](https://github.com/MirS0bhan/sanad/releases)) in github
- then install it with this command: `gnome-extensions install sanad@apps.mirsobhan.ir.shell-extension.zip`

### Adding custom name servers
you can put your custom dns server into `~/.local/share/gnome-shell/extensions/sanad@apps.mirsobhan.ir/sanad.ns.csv` by adding it in csv format like : `Provider,DNS1,DNS2`
#### using by one command
```bash
$ echo "xyz,192.168.198.123,192.168.199.124" >> ~/.local/share/gnome-shell/extensions/sanad@apps.mirsobhan.ir/sanad.ns.csv
```

![Screenshot From 2025-02-20 23-35-36](https://github.com/user-attachments/assets/b9e1cd75-1406-4d35-9bd8-1ff9892ec39c)

