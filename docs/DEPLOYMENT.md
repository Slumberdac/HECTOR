# Deploying HECTOR on a Raspberry Pi

Target setup: a Raspberry Pi running 64-bit Raspberry Pi OS, serving a domain
whose DNS is on Cloudflare, reachable over a Cloudflare Tunnel with no ports
forwarded on the home router.

Work through it in order. Steps 0 through 3 take about half an hour; step 4 is
where the site goes live.

---

## 0. Before you start

**Hardware.** A Pi 4 or Pi 5, any RAM size; 4 GB is comfortable.

The database is FerretDB rather than MongoDB, and that is not a preference.
Every MongoDB release from 5.0 onward requires an ARMv8.2-A CPU. The Pi 4's
Cortex-A72 is ARMv8.0-A, so `mongod` dies on startup with
`Illegal instruction (core dumped)`; the Pi 5's Cortex-A76 would be fine, but
running the same stack on both is worth more than the difference. FerretDB
implements the MongoDB wire protocol on top of PostgreSQL, which has no such
requirement. The application code does not change: it is still Mongoose talking
to port 27017.

If you want to know which you have:

```bash
cat /proc/device-tree/model; echo
```

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

Steps 2 to 4 run **on the Pi**. Check the prompt before each one: the SSH server
you want to change is the Pi's, not your laptop's. If `sshd -t` answers
`sshd: no hostkeys available`, you are on a machine that has never run an SSH
server, which means you are on the wrong one.

```bash
ssh pi                              # if you are not already on it

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

**Give the database some headroom.** PostgreSQL dislikes running out of memory.
On a Pi 5 with 8 GB this is precautionary rather than necessary; with 4 GB it is
cheap insurance. Look at what you already have before changing anything, because
Raspberry Pi OS has used three different swap mechanisms over the years:

```bash
free -h
swapon --show
```

If `swapon --show` already lists a `/dev/zram0` device, you are on an image that
uses zram and you should leave it alone. zram is compressed RAM rather than a
file on the card: it does not add capacity the way a swapfile does, but it is
considerably kinder to an SD card, and for this workload it is the better
arrangement. Skip ahead to step 2.

Otherwise, whichever tool your image ships:

```bash
# older images (dphys-swapfile)
sudo dphys-swapfile swapoff
sudo sed -i 's/^CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup && sudo dphys-swapfile swapon

# newer images (rpi-swap), configured by drop-in and applied on reboot
sudo mkdir -p /etc/rpi/swap.conf.d
# see `man swap.conf` for the keys your version accepts, then:
sudo reboot
```

`dphys-swapfile: command not found` simply means your image uses one of the
others. It is not an error to fix, it is a branch to take.

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

Generate three distinct secrets and write them straight into the file, rather
than printing them and pasting by hand. `sed` replaces the existing line for
each key, so nothing ends up defined twice:

```bash
for n in POSTGRES_PASSWORD JWT_SECRET; do
  v=$(openssl rand -base64 36 | tr -d '/+=' | head -c 48)
  sed -i "s|^$n=.*|$n=$v|" .env
done
unset v
```

`POSTGRES_USER` already has a workable default in the example file, as do the
two image tags. Leave `CLOUDFLARE_TUNNEL_TOKEN` empty for now; step 4 produces
it.

**Check the file before going further.** Two mistakes here fail in ways that are
hard to read later:

```bash
chmod 600 .env

# a key defined twice: the LAST one wins, silently, even if it is empty
grep -oE '^[A-Z_]+' .env | sort | uniq -d

# a key that should have a value and does not
grep -nE '^(POSTGRES_USER|POSTGRES_PASSWORD|JWT_SECRET)=$' .env
```

Both should print nothing. `${VAR:?}` in the compose file treats empty exactly
like unset, so a duplicate key with an empty value produces
`required variable X is missing a value` even though the name is right there in
the file with a good value above it.

`.env` is gitignored. Keep it that way; if you ever need it elsewhere, copy it
over SSH rather than committing it.

> `POSTGRES_PASSWORD` is written into the database on its very first boot.
> Changing it in `.env` afterwards does not change it in Postgres, so the API
> would then fail to authenticate. To rotate it, change it inside Postgres with
> `ALTER ROLE` as well, or destroy the volume and restore from a backup.
>
> FerretDB has no user table of its own: it authenticates against PostgreSQL, so
> the Postgres credentials are also the ones in `MONGODB_URI`. That is why there
> is no separate application-user bootstrap step.

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

Resolve the configuration before building anything. This substitutes every
`${VAR}` and reports what is missing, without pulling an image or starting a
container:

```bash
docker compose config --quiet && echo "env OK"
```

Then:

```bash
docker compose up -d --build
```

The first build takes a few minutes on a Pi. Then:

```bash
docker compose ps                    # five services; postgres should be healthy
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
# Dump from Atlas with a NEW temporary user and an autogenerated password, not
# the leaked one and not something guessable. mongodump and mongorestore are
# separate Go binaries with none of mongod's ARMv8.2-A requirement, so they run
# fine on a Pi 4 even though the server does not; the ARMv8.2 warning the image
# prints applies to mongod alone.
#
# --user is what makes the output file writable: the image runs as its own
# mongodb user, which cannot write to your home directory.
cd ~/HECTOR
docker run --rm --user "$(id -u):$(id -g)" -v "$PWD:/out" mongo:8 mongodump \
  --uri "mongodb+srv://tmp_export:PASSWORD@hector.lnv1yey.mongodb.net/test" \
  --gzip --archive=/out/hector-v1.archive.gz

# Restore straight into FerretDB over the wire protocol.
set -a && source .env && set +a
docker compose run --rm --entrypoint mongorestore -v "$PWD:/in" mongo:8 \
  --uri "mongodb://$POSTGRES_USER:$POSTGRES_PASSWORD@ferretdb:27017/hector" \
  --gzip --archive=/in/hector-v1.archive.gz --nsFrom 'test.*' --nsTo 'hector.*'

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

`ops/backup.sh` in the repo does a `pg_dump` into a timestamped archive and
prunes anything older than 30 days. It dumps PostgreSQL rather than going
through FerretDB, so it captures everything including indexes and does not
depend on the wire-protocol layer being healthy at 3am. Schedule it:

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
gunzip -c ops/backups/hector-TIMESTAMP.sql.gz |
  docker compose exec -T -e PGPASSWORD="$POSTGRES_PASSWORD" \
    postgres psql --username "$POSTGRES_USER" --dbname postgres
```

For a from-scratch restore, bring the stack down, drop the volume, start only
Postgres so the extension initialises, then pipe the dump in:

```bash
docker compose down
docker volume rm hector_pg-data
docker compose up -d postgres
# wait for it to report healthy, then run the psql line above
docker compose up -d
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

Base images (postgres/DocumentDB, ferretdb, caddy, cloudflared) update
separately:

```bash
docker compose pull
docker compose up -d
```

`FERRETDB_TAG` and `DOCUMENTDB_TAG` are pinned in `.env` rather than floating,
so `pull` will not move them. Bump the two together, from the same FerretDB
release, and take a backup first: the DocumentDB tag encodes the FerretDB
version it belongs to and a mismatched pair is refused at startup.

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
You are running MongoDB rather than FerretDB on a pre-ARMv8.2-A CPU. See step 0.
Nothing in the current compose file starts `mongod`.

**`docker compose up` fails with `set POSTGRES_PASSWORD in .env`.**
The compose file uses `${VAR:?}` so a missing secret fails loudly at startup
rather than silently starting an unauthenticated database. Fill in `.env`, and
check for a duplicate key: the last definition wins even when it is empty.

**The API logs `Authentication failed`.**
`POSTGRES_PASSWORD` was changed in `.env` after the volume was initialised.
Postgres stores the password it was created with and does not re-read `.env`.
Either change it inside Postgres:

```bash
docker compose exec -e PGPASSWORD="$OLD_PASSWORD" postgres \
  psql -U "$POSTGRES_USER" -d postgres \
  -c "ALTER ROLE \"$POSTGRES_USER\" WITH PASSWORD '$NEW_PASSWORD';"
```

or `docker compose down -v` (destroys data) and restore from backup.

**The API logs `Database not reachable yet, retrying`.**
Normal on a cold boot: the API starts before FerretDB is accepting connections
and retries with backoff. If it never stops, `docker compose logs ferretdb` and
`docker compose logs postgres` in that order; FerretDB will not serve until
Postgres reports healthy.

**Something works in the tests but not on the Pi.**
The test suite runs against real MongoDB; production runs FerretDB, whose
coverage of the MongoDB API is good but not total. `npm run check:db` probes the
deployed database for the specific operations this codebase depends on and names
whichever one is missing.

**Cloudflare shows error 502.**
cloudflared reached the tunnel but not the origin. Check the public hostname is
`http://web:8080`. `localhost:8080` will not work from inside the cloudflared
container.

**Cloudflare shows error 1033.**
The tunnel connector is not running. `docker compose logs cloudflared`; usually
a bad or revoked token.

**`dependency failed to start: container hector-postgres-1 is unhealthy`.**
Postgres did not come up. Read the log:

```bash
docker compose logs postgres | tail -40
docker inspect --format '{{json .State.Health}}' hector-postgres-1
```

**After a failed first boot, discard the volume before retrying.** The
DocumentDB extension is installed on first start against an empty data
directory, so a half-initialised volume stays half-initialised however many
times you restart:

```bash
docker compose down -v        # -v destroys hector_pg-data
docker compose up -d
```

`-v` is safe here and only here: at this point the database has nothing in it.
Once you have real data, `down -v` throws it away.

**FerretDB logs a DocumentDB version mismatch.**
`FERRETDB_TAG` and `DOCUMENTDB_TAG` in `.env` have drifted apart. They are
released in lockstep and the DocumentDB tag encodes the FerretDB version it
belongs to; set both from the same release.

**The site loads but every API call 502s.**
The `api` container is unhealthy. `docker compose logs api`. Most often the
config validator rejected an environment variable and the process exited; the
message names the variable. `MongoServerError: Authentication failed` instead
means the application user was never created, which is the failed-first-boot
case above.

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
| `postgres`    | `postgres-documentdb`    | 5432            | `ferretdb` only                        |
| `ferretdb`    | `ferretdb:2`             | 27017           | `api` only                             |
| `api`         | built from `backend/`    | 5000            | `web` only                             |
| `web`         | Caddy + built bundle     | 8080            | `cloudflared`, and 127.0.0.1 on the Pi |
| `cloudflared` | `cloudflare/cloudflared` | nothing inbound | nothing                                |

Only `web` publishes a host port, and only on loopback, for debugging over SSH.
Everything the public reaches arrives through the tunnel.
