# GCP DEPLOYMENT GUIDE



Passwordless Sudo Configuration

On your VM, run:

`sudo visudo`


Add at the bottom:


`mosesimbahale0 ALL=(ALL) NOPASSWD: /usr/bin/mkdir, /usr/bin/chown, /usr/bin/docker-compose, /usr/bin/docker`