# About

We use an AWS Ansible-based docker development environment
called [fxa-dev](https://github.com/mozilla/fxa-dev) to deploy different versions of the FxA stack.
It can be found here [https://github.com/mozilla/fxa-dev](https://github.com/mozilla/fxa-dev) (make sure to use the `docker` branch).

## Notes

You can find a lot of important information about fxa-dev usage in its [README.md](https://github.com/mozilla/fxa-dev#usage).
Here are some additional notes that expand on the README:

### SSH

You can ssh into the EC2 instance with `ssh ec2-user@meta-{{ whatever you configured in foo.yml }}`.

### Ansible Logs

The Ansible polling / update log can be found here: `/var/log/ansible/update.log`

### Docker Commands

[Build](https://docs.docker.com/engine/reference/commandline/build/)

```
docker build --no-cache=true -t TAG_NAME .
```

Use `--file` to specify a custom Dockerfile file like `--file Dockerfile-build`.

Example: `docker build --no-cache=true -t vladikoff/123done  .`

Tag

```
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
```

Example: `docker tag vladikoff/123done vladikoff/123done:oauth-keys`

Push

```
docker push NAME[:TAG]
```

Example: `docker push vladikoff/123done:oauth-keys`

### MySQL SSH Access

You can access the MySQL database via SSH. Here's an example configuration using Sequel Pro on macOS.
Make sure to specify your SSH Password using a path to your private key. In this example we
are connecting to a stack called `test62`:

<img src=https://i.imgur.com/T9yL9Ti.jpg width=350 />
