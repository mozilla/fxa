# Reputation Service Integration Tests

Executes integration tests between fxa-customs-server and an instance
of the iprepd daemon.

```
docker build -f Dockerfile-build -t fxa-customs-server:build .
cd test/integration/reputation
docker-compose build
docker-compose run customs
docker-compose down
```
