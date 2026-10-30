// Builds per-service images in parallel: `docker buildx bake`

group "default" {
  targets = ["auth", "profile", "content", "123done"]
}

target "base" {
  context    = "."
  dockerfile = "Dockerfile"
  target     = "fxa-base"
}

target "_service" {
  context  = "."
  contexts = { fxa-base = "target:base" }
  target   = "production"
}

target "auth" {
  inherits   = ["_service"]
  dockerfile = "packages/fxa-auth-server/Dockerfile"
  tags       = ["fxa-auth-server:latest"]
}

target "profile" {
  inherits   = ["_service"]
  dockerfile = "packages/fxa-profile-server/Dockerfile"
  tags       = ["fxa-profile-server:latest"]
}

target "content" {
  inherits   = ["_service"]
  dockerfile = "packages/fxa-content-server/Dockerfile"
  tags       = ["fxa-content-server:latest"]
}

target "123done" {
  inherits   = ["_service"]
  dockerfile = "packages/123done/Dockerfile"
  tags       = ["fxa-123done:latest"]
}
