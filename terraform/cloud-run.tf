resource "google_cloud_run_service" "app" {
  name                       = local.name
  location                   = local.region
  autogenerate_revision_name = true

  template {

    metadata {
      annotations = {
        "run.googleapis.com/client-name" = "terraform"
        "autoscaling.knative.dev/minScale" : "1"
        "autoscaling.knative.dev/maxScale" : "5"
        "run.googleapis.com/cpu-throttling" : true
        "run.googleapis.com/startup-cpu-boost" : true
      }
    }
    spec {
      containers {
        image = "europe-west6-docker.pkg.dev/hip-polymer-387617/z-index-gcp-registry/z-index-next-app-at:${local.tag}"
        resources {
          limits = {
            "cpu" : "2000m"
            "memory" = "1Gi"
          }
        }

        dynamic "env" {
          for_each = local.environment_vars
          content {
            name  = env.key
            value = env.value
          }
        }

        ports {
          name           = "http1"
          container_port = 3000
        }
        startup_probe {
          initial_delay_seconds = 2
          timeout_seconds       = 2
          period_seconds        = 3
          failure_threshold     = 1
          tcp_socket {
            port = 3000
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
