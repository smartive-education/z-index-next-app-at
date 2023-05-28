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

terraform {
  backend "gcs" {
    bucket = "z-index-at-tf-state-container"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.66.0"
    }
  }
}

data "google_project" "project" {
  project_id = "hip-polymer-387617"
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers"
    ]
  }
}


