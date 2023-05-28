locals {
  name   = "z-index-at"
  region = "europe-west6"
  environment_vars = {
    apiUrl         = var.apiUrl,
    nextauthUrl    = var.nextauthUrl,
    nextauthSecret = var.nextauthSecret,
    issuer         = var.issuer,
    clientId       = var.clientId
  }
}

provider "google" {
  project = "z-index-at-project"
  region  = local.region
}

data "google_project" "project" {
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers"
    ]
  }
}

terraform {
  backend "gcs" {
    bucket = "z-index-at-tf-state-container"
  }
}
