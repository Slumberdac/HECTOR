# Deploying HECTOR on a Raspberry Pi

Target setup: a Raspberry Pi 5 running 64-bit Raspberry Pi OS, serving a domain
whose DNS is on Cloudflare, reachable over a Cloudflare Tunnel with no ports
forwarded on the home router.

Work through it in order. Steps 0 through 3 take about half an hour; step 4 is
where the site goes live.

---

## 0. Before you start

**Hardware.** Pi 5 (any RAM size; 4 GB is comfortable). The compose file runs
MongoDB 8, which requires an ARMv8.2-A CPU. The Pi 5's Cortex-A76 has it. A Pi
4's Cortex-A72 does not, and `mongod` there dies immediately with `Illegal
instruction (core dumped)`. If you ever move this to a Pi 4, you need
MongoDB 4.4 or a wire-compatible substitute like FerretDB.

**Storage.** An SD card will work and will eventually wear out under a database
write load. A USB SSD is the better home for `/var/lib/docker`. If you stay on
SD, take the backups in step 6 seriously.

**Accounts.** A Cloudflare account with your domain's nameservers already
pointed at it.

**Rotate the old credential first.** The repository's history contains a live
MongoDB Atlas connection string. Delete that database user in Atlas (Database
Access → `hector_admin` → Delete) before going any further. History rewriting
does not help: the repo has been public, so the credential must be considered
burned.

---

## 1. Prepare the Pi

Flash 64-bit Raspberry Pi OS Lite (no desktop needed) with Raspberry Pi Imager,
setting hostname, user, and SSH key in the imager's advanced options. Then SSH
in and:

```bash
sudo apt update && sudo apt full-upgrade -y
sudo reboot
```

Confirm you are on 64-bit:

```bash
uname -m          # expect aarch64
```

### Lock down SSH

You are about to run a service that talks to the internet. The Pi itself should
not accept password logins: a guessable password on a box that is up 24/7 is the
single most common way a home server gets taken over.

Do these in order. Turning passwords off before confirming your key works is how
people lock themselves out.

**1. Prove your key already works.** If you gave the Imager a public key in its
advanced options it is already in `~/.ssh/authorized_keys` on the Pi. Check from
your laptop:

```bash
ssh -o PreferredAuthentications=publickey -o PasswordAuthentication=no pi@raspberrypi.local
```

A shell means the key is in place; skip to step 2.

`Permission denied (publickey,password)` means it is not, and the trailing
`password` in that list is your reassurance that you can still get in the old
way while you fix it. Install a key now:

```bash
ls -la ~/.ssh/                      # is there an id_ed25519 at all?

# only if you have no key yet:
ssh-keygen -t ed25519 -C "$USER@$(hostname)"

ssh-copy-id -i ~/.ssh/id_ed25519.pub pi@raspberrypi.local   # asks for the Pi password
```

`ssh-copy-id: ERROR: No identities found` means there is no keypair to copy, so
run the `ssh-keygen` line first. Then re-run the publickey-only check above and
do not continue until it gives you a shell.

Worth putting in `~/.ssh/config` while you are here, so the right key is offered
and the passphrase is asked for once per session rather than once per connection:

```
Host pi
    Hostname raspberrypi.local
    User YOUR_USER
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes
```

**2. Write a drop-in rather than editing the main file.** Debian's
`sshd_config` begins with `Include /etc/ssh/sshd_config.d/*.conf`, and sshd
keeps the _first_ value it parses for any directive. Anything in that directory
therefore beats what you write further down in the main file, which is why
editing `sshd_config` by hand so often appears to do nothing.

```bash
ls /etc/ssh/sshd_config.d/          # see what is already there

sudo tee /etc/ssh/sshd_config.d/10-hardening.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
EOF
```

`KbdInteractiveAuthentication` matters as much as `PasswordAuthentication`.
With `UsePAM yes` (the default) it opens a second, PAM-driven prompt that also
accepts a password, so turning off only the first setting leaves the door open.

Files in that directory are read in lexical order, so if something already there
sorts before `10-` and sets these differently, it wins. Step 3 is what tells you.

**3. Check the syntax, then the effective result.**

```bash
sudo sshd -t          # syntax check; silence means valid

sudo sshd -T | grep -Ei '^(passwordauthentication|kbdinteractive|permitrootlogin|pubkeyauthentication)'
```

`sshd -T` prints the configuration sshd will actually use, after every include
and override. This is the only output worth trusting. Expect:

```
passwordauthentication no
kbdinteractiveauthentication no
permitrootlogin no
pubkeyauthentication yes
```

**4. Restart, and test from a second terminal.**

```bash
sudo systemctl restart ssh
# if that reports no such unit, the system uses socket activation:
#   sudo systemctl restart ssh.socket
```

Leave your current session open. Open a new terminal and connect again. Only
close the first one once the second has worked. An existing session survives an
sshd restart, so it stays as your way back in if the new config is wrong.

Optional, if you have a hardware key: `ssh-keygen -t ed25519-sk` makes a key
whose private half cannot leave the token, so a copy of your laptop's disk is
not enough to log into the Pi. It needs OpenSSH 8.2 or newer at both ends, which
Pi OS has.

**If you do lock yourself out:** attach a keyboard and monitor, or shut the Pi
down, put the card in your Arch machine, mount the ext4 partition and delete
`/etc/ssh/sshd_config.d/10-hardening.conf`. Nothing is unrecoverable, it is just
tedious.

**Automatic security updates.** Nobody patches a Pi they cannot see.

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

**Give the database some headroom.** MongoDB dislikes running out of memory.

```bash
sudo dphys-swapfile swapoff
sudo sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup && sudo dphys-swapfile swapon
```

---

## 2. Install Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
newgrp docker            # or log out and back in
docker run --rm hello-world
```

Cap the journal so logs cannot fill the card:

```bash
sudo mkdir -p /etc/docker
echo '{"log-driver":"json-file","log-opts":{"max-size":"10m","max-file":"3"}}' \
  | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

---

## 3. Get the code and generate secrets

```bash
git clone https://github.com/Slumberdac/HECTOR.git
cd HECTOR
cp .env.example .env
```

Generate three distinct secrets:

```bash
for n in MONGO_ROOT_PASSWORD MONGO_APP_PASSWORD JWT_SECRET; do
  echo "$n=$(openssl rand -base64 36 | tr -d '/+=' | head -c 48)"
done
```

Paste those into `.env`. Fill in `MONGO_ROOT_USERNAME` and
`MONGO_APP_USERNAME` (the defaults in the example file are fine). Leave
`CLOUDFLARE_TUNNEL_TOKEN` empty for now; step 4 produces it.

```bash
chmod 600 .env
```

`.env` is gitignored. Keep it that way; if you ever need it elsewhere, copy it
over SSH rather than committing it.

> `MONGO_APP_PASSWORD` is consumed once, on the very first boot, by
> `ops/mongo-init/01-create-app-user.js`. Changing it later has no effect on an
> existing volume; you have to change the password inside mongo, or destroy the
> volume and restore from a backup.

---

## 4. Create the Cloudflare Tunnel

In the Cloudflare dashboard: **Zero Trust → Networks → Tunnels → Create a
tunnel → Cloudflared**. Name it `hector-pi`.

The install screen shows a `docker run cloudflare/cloudflared … --token
eyJhIjoi…` command. You do not need to run it. Copy just the token and put it
in `.env`:

```
CLOUDFLARE_TUNNEL_TOKEN=eyJhIjoi…
```

That token is a credential with the power to publish services from your network.
Treat it like a password.

Then, on the tunnel's **Public Hostname** tab, add a route:

| Field     | Value                    |
| --------- | ------------------------ |
| Subdomain | leave blank, or `hector` |
| Domain    | your domain              |
| Path      | leave blank              |
| Type      | `HTTP`                   |
| URL       | `web:8080`               |

`web:8080` is the container name and port on the compose network; cloudflared
resolves it over Docker's internal DNS, so nothing is exposed to the LAN. The
DNS record is created for you because the zone is already on Cloudflare.

If you want the bare domain _and_ `www`, add a second public hostname with
subdomain `www` pointing at the same `web:8080`.

---

## 5. First deploy

```bash
docker compose up -d --build
```

The first build takes a few minutes on a Pi. Then:

```bash
docker compose ps                    # all four services, api and web healthy
docker compose logs -f api           # expect "Connected to MongoDB"
curl -fsS http://127.0.0.1:8080/healthz
curl -fsS http://127.0.0.1:8080/api/v1/rocks
```

Visit your domain. Register an account, add a companion, sign out, sign back in.

**Check that the fixes are actually in effect:**

```bash
# No password material anywhere in the user registry.
curl -s https://your-domain/api/v1/users | grep -i password || echo "clean"

# Anonymous callers cannot create.
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://your-domain/api/v1/rocks \
  -H 'Content-Type: application/json' -d '{"name":"x"}'      # expect 401

# The session cookie is httpOnly and Secure.
curl -si -X POST https://your-domain/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"you","password":"…"}' | grep -i set-cookie
# expect: HttpOnly; Secure; SameSite=Strict
```

---

## 5b. Importing the old Atlas data (optional)

Only if you want the registry to start with the original rocks and accounts
rather than empty. See [MIGRATION.md](MIGRATION.md) for the whole procedure;
the shape of it is:

```bash
# On your laptop: dump from Atlas with a NEW temporary user, not the leaked one.
docker run --rm -v "$PWD:/out" mongo:8 mongodump \
  --uri "mongodb+srv://tmp_export:PASSWORD@hector.lnv1yey.mongodb.net/test" \
  --gzip --archive=/out/hector-v1.archive.gz

# Copy to the Pi and restore into the new database.
scp hector-v1.archive.gz pi@raspberrypi.local:~/HECTOR/
docker compose cp hector-v1.archive.gz mongo:/tmp/v1.gz
docker compose exec mongo mongorestore \
  --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --gzip --archive=/tmp/v1.gz --nsFrom 'test.*' --nsTo 'hector.*'

# Convert v1 documents to the v2 shape: bcrypt the plaintext passwords,
# normalise owners, build the unique index.
npm run migrate:v1 -- --dry-run     # reports what it would change
npm run migrate:v1
docker compose restart api
```

Delete the temporary Atlas user and the archive file afterwards; that archive
contains every account's password in the clear.

---

## 6. Backups

A Pi's SD card will fail eventually. Assume it.

```bash
mkdir -p ~/HECTOR/ops/backups
```

`ops/backup.sh` in the repo does a `mongodump` into a timestamped archive and
prunes anything older than 30 days. Schedule it:

```bash
crontab -e
# 15 3 * * *  /home/YOUR_USER/HECTOR/ops/backup.sh >> /home/YOUR_USER/HECTOR/ops/backup.log 2>&1
```

Backups on the same card as the data are not backups. Copy them somewhere else:
a cron'd `rclone`, `rsync` to another machine, or a scheduled pull from your
laptop:

```bash
rsync -av pi@raspberrypi.local:HECTOR/ops/backups/ ~/hector-backups/
```

Restoring:

```bash
docker compose cp ops/backups/hector-2026-08-22.archive mongo:/tmp/restore.archive
docker compose exec mongo mongorestore \
  --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin --archive=/tmp/restore.archive --drop
```

Test a restore once, now, while nothing depends on it working.

---

## 7. Updating

```bash
cd ~/HECTOR
git pull
docker compose up -d --build
docker image prune -f
```

Base images (mongo, caddy, cloudflared) update separately:

```bash
docker compose pull
docker compose up -d
```

Do a `mongo` major-version bump deliberately, not as a side effect of `pull`;
read the release notes and take a backup first.

---

## 8. Optional hardening

**Cloudflare WAF rate limiting.** The API rate-limits itself, but blocking
abuse at Cloudflare's edge means it never reaches your home connection. Security
→ WAF → Rate limiting rules: something like 100 requests per minute per IP to
`/api/*`.

**Cloudflare Access on the tunnel's admin surface.** Not needed here since
there is no admin panel, but if you ever add one, Access gates it behind an
identity provider without any code.

**Bot Fight Mode** (Security → Bots) costs nothing and removes most of the
background noise.

**Uptime checks.** `GET /healthz` returns 503 when the database is down. Point
any free uptime monitor at it.

---

## Troubleshooting

**`mongod` exits immediately with `Illegal instruction`.**
You are on a Pi 4 or older. See step 0.

**`docker compose up` fails with `set MONGO_APP_PASSWORD in .env`.**
The compose file uses `${VAR:?}` so a missing secret fails loudly at startup
rather than silently starting an unauthenticated database. Fill in `.env`.

**The API logs `MongoServerError: Authentication failed`.**
`MONGO_APP_PASSWORD` was changed after the volume was initialised. The init
script only runs on an empty data directory. Either set the password inside
mongo, or `docker compose down -v` (destroys data) and restore from backup.

**Cloudflare shows error 502.**
cloudflared reached the tunnel but not the origin. Check the public hostname is
`http://web:8080`. `localhost:8080` will not work from inside the cloudflared
container.

**Cloudflare shows error 1033.**
The tunnel connector is not running. `docker compose logs cloudflared`; usually
a bad or revoked token.

**The site loads but every API call 502s.**
The `api` container is unhealthy. `docker compose logs api`. Most often the
config validator rejected an environment variable and the process exited; the
message names the variable.

**Sign-in appears to work but you are immediately signed out.**
The session cookie is `Secure`, so it is only sent over HTTPS. Reaching the site
over plain HTTP (for example directly at `http://pi-ip:8080`) will do this. Use
the real domain.

**Builds run out of memory on the Pi.**
Increase swap (step 1), or build the images on your laptop with
`docker buildx build --platform linux/arm64` and push them to a registry.

---

## What runs where

| Container     | Image                    | Listens         | Reachable from                         |
| ------------- | ------------------------ | --------------- | -------------------------------------- |
| `mongo`       | `mongo:8`                | 27017           | `api` only                             |
| `api`         | built from `backend/`    | 5000            | `web` only                             |
| `web`         | Caddy + built bundle     | 8080            | `cloudflared`, and 127.0.0.1 on the Pi |
| `cloudflared` | `cloudflare/cloudflared` | nothing inbound | nothing                                |     |

Only `web` publishes a host port, and only on loopback, for debugging over SSH.
Everything the public reaches arrives through the tunnel.
