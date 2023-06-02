# Variables are passed down from .yaml

variable "nextauthUrl" {
  type        = string
  description = "Url of the deployed application"
}

variable "nextauthSecret" {
  type        = string
  description = "Secret used by nextauth to secure tokens as cookies"
}

variable "issuer" {
  type        = string
  description = "OIDC Token Issuer Authority"
}

variable "clientId" {
  type        = string
  description = "Id of the Application as registered at the Token Issuer"
}

variable "TAG" {	
  type        = string	
  description = "Tag of the docker image to deploy"	
}
