# SANAD
sanad is a DNS changer extensions for Gnome.

The name is a equivalent for DNS in persian(سامانه نام دامنه) 

### How to install
#### install from gnome extentions site
- go [here](https://extensions.gnome.org/extension/7861/sanad/) and install it 
#### install from github
- download the extension zip file from the last [release](https://github.com/MirS0bhan/sanad/releases) in github
- then install it with this command: `gnome-extensions install sanad@apps.mirsobhan.ir.shell-extension.zip`

### Adding custom name servers
you can put your custom dns server into `~/.config/sanad@apps.mirsobhan.ir/sanad.ns.csv` by adding it in csv format like : `Provider,DNS1,DNS2`

#### using by one command
```bash
$ echo "xyz,192.168.198.123,192.168.199.124" >> `~/.config/sanad@apps.mirsobhan.ir/sanad.ns.csv
```
### چطوری DNS های تحریم شکن رو اضافه کنیم بهش ؟ 
این [پرونده](https://raw.githubusercontent.com/MirS0bhan/sanad/refs/heads/master/dns.csv) ساناد های تحریم‌شکن هست و میتونید به صورت دستی هم طبق راهنمای بالا به افزونه ساناد اضافه کنید. بخاطر اینکه گنوم توسط ردهت میزبانی میشه و ردهت در آمریکا ثبت شده است به همین خاطر با احترام قبول نکردن که این DNS ها قرار بگیره توی خود افزونه و گفتن دنبال یه راهکار جداگانه ای باش. 

با دستور زیر هم میتونید همین‌کار رو مستقیم انجام بدید
```bash
curl -s https://raw.githubusercontent.com/MirS0bhan/sanad/refs/heads/master/dns.csv >> ~/.config/sanad@apps.mirsobhan.ir/sanad.ns.csv
```

![Screenshot From 2025-02-20 23-35-36](https://github.com/user-attachments/assets/b9e1cd75-1406-4d35-9bd8-1ff9892ec39c)

