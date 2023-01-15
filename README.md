# Lennon

### Deploy commands

```sh
systemctl status lennon
journalctl -u lennon -e
sudo nano /etc/systemd/system/lennon.service
sed 's/\r$//' file.txt > out.txt
```