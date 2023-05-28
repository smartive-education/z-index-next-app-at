resource "google_cloud_run_service" "app" {
  name                       = local.name
  location                   = local.region
  autogenerate_revision_name = true

  template {
    spec {
      containers {
        image = "europe-west6-docker.pkg.dev/hip-polymer-387617/z-index-gcp-registry/z-index-next-app-at"

        resources {
          limits = {
            "memory" = "256Mi"
          }
        }

        ports {
          name           = "http1"
          container_port = 8080
        }

        dynamic "env" {
          for_each = local.environment_vars
          content {
              name  = env.key
              value = env.value
          }
        }
      }

      service_account_name = google_service_account.cloud-runner.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

output "cloud-run-url" {
  value = google_cloud_run_service.app.status[0].url
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.app.location
  project  = google_cloud_run_service.app.project
  service  = google_cloud_run_service.app.name

  policy_data = data.google_iam_policy.noauth.policy_data
}