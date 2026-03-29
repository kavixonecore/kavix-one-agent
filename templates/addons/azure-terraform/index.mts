import { TemplateType } from "../../../src/core/enums/index.mjs";

import type {
  IFeatureSpec,
  IGeneratedFile,
  IGenerationContext,
  IRenderedFile,
  ITemplate,
  IValidationResult,
} from "../../../src/core/interfaces/index.mjs";

/**
 * Azure Terraform addon template.
 * Generates Terraform infrastructure files for an Elysia API project on Azure.
 * Produces: Resource Group, ACR, Container App, Cosmos DB, Storage Queue (optional),
 * Key Vault, and Managed Identity.
 */
export const azureTerraformTemplate: ITemplate = {

  name: "azure-terraform",
  type: TemplateType.ADDON,
  description: "Generates Terraform infrastructure files for Azure (Resource Group, ACR, Container App, Cosmos DB, Key Vault, Managed Identity, optional Storage Queue)",

  plan(feature: IFeatureSpec): IGeneratedFile[] {
    return [
      {
        path: "infrastructure/providers.tf",
        description: "Terraform provider configuration for Azure",
        templateName: "azure-terraform",
        featureName: feature.name,
      },
      {
        path: "infrastructure/variables.tf",
        description: "Terraform input variables",
        templateName: "azure-terraform",
        featureName: feature.name,
      },
      {
        path: "infrastructure/main.tf",
        description: "Main Terraform resources: Resource Group, ACR, Container App, Cosmos DB, Key Vault, Managed Identity, Storage Queue",
        templateName: "azure-terraform",
        featureName: feature.name,
      },
      {
        path: "infrastructure/outputs.tf",
        description: "Terraform output values",
        templateName: "azure-terraform",
        featureName: feature.name,
      },
    ];
  },

  render(feature: IFeatureSpec, context: IGenerationContext): IRenderedFile[] {
    const { projectName } = context;
    const hasQueue = feature.description?.toLowerCase()
.includes("queue") ?? false;

    return [
      {
        path: "infrastructure/providers.tf",
        content: renderProviders(),
        featureName: feature.name,
      },
      {
        path: "infrastructure/variables.tf",
        content: renderVariables(projectName),
        featureName: feature.name,
      },
      {
        path: "infrastructure/main.tf",
        content: renderMain(projectName, hasQueue),
        featureName: feature.name,
      },
      {
        path: "infrastructure/outputs.tf",
        content: renderOutputs(),
        featureName: feature.name,
      },
    ];
  },

  validate(files: IRenderedFile[]): IValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const expectedPaths = [
      "infrastructure/providers.tf",
      "infrastructure/variables.tf",
      "infrastructure/main.tf",
      "infrastructure/outputs.tf",
    ];

    for (const expected of expectedPaths) {
      if (!files.some((f) => f.path === expected)) {
        errors.push(`Missing required file: ${expected}`);
      }
    }

    for (const file of files) {
      if (!file.content || file.content.trim() === "") {
        errors.push(`File has empty content: ${file.path}`);
      }
    }

    return { valid: errors.length === 0, errors, warnings };
  },
};

function renderProviders(): string {
  return `terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.110"
    }
  }

  backend "azurerm" {
    resource_group_name  = var.tf_state_resource_group
    storage_account_name = var.tf_state_storage_account
    container_name       = "tfstate"
    key                  = "\${var.project_name}-\${var.environment}.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}
`;
}

function renderVariables(projectName: string): string {
  return `variable "project_name" {
  description = "The name of the project."
  type        = string
  default     = "${projectName}"
}

variable "environment" {
  description = "The deployment environment (dev, staging, prod)."
  type        = string
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "eastus"
}

variable "tf_state_resource_group" {
  description = "Resource group containing the Terraform state storage account."
  type        = string
}

variable "tf_state_storage_account" {
  description = "Storage account for Terraform state."
  type        = string
}

variable "cosmos_db_throughput" {
  description = "Cosmos DB provisioned throughput (RU/s)."
  type        = number
  default     = 400
}

variable "container_app_cpu" {
  description = "CPU cores allocated to the Container App."
  type        = number
  default     = 0.5
}

variable "container_app_memory" {
  description = "Memory (GiB) allocated to the Container App."
  type        = string
  default     = "1.0Gi"
}

variable "container_image" {
  description = "Docker image reference for the API container."
  type        = string
}
`;
}

function renderMain(projectName: string, includeQueue: boolean): string {
  const queueBlock = includeQueue
    ? `
# ---------------------------------------------------------------------------
# Azure Storage Queue
# ---------------------------------------------------------------------------
resource "azurerm_storage_account" "queue" {
  name                     = replace("\${local.resource_prefix}queue", "-", "")
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = local.common_tags
}

resource "azurerm_storage_queue" "main" {
  name                 = "\${local.resource_prefix}-queue"
  storage_account_name = azurerm_storage_account.queue.name
}
`
    : "";

  const queueSecretBlock = includeQueue
    ? `
  secret {
    name  = "storage-connection-string"
    value = azurerm_storage_account.queue.primary_connection_string
  }
`
    : "";

  const queueEnvBlock = includeQueue
    ? `
      env {
        name        = "AZURE_STORAGE_CONNECTION_STRING"
        secret_name = "storage-connection-string"
      }
      env {
        name  = "AZURE_STORAGE_QUEUE_NAME"
        value = azurerm_storage_queue.main.name
      }
`
    : "";

  return `locals {
  resource_prefix = "\${var.project_name}-\${var.environment}"
  common_tags = {
    project     = var.project_name
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ---------------------------------------------------------------------------
# Resource Group
# ---------------------------------------------------------------------------
resource "azurerm_resource_group" "main" {
  name     = "\${local.resource_prefix}-rg"
  location = var.location
  tags     = local.common_tags
}

# ---------------------------------------------------------------------------
# Managed Identity
# ---------------------------------------------------------------------------
resource "azurerm_user_assigned_identity" "api" {
  name                = "\${local.resource_prefix}-identity"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tags                = local.common_tags
}

# ---------------------------------------------------------------------------
# Azure Container Registry
# ---------------------------------------------------------------------------
resource "azurerm_container_registry" "main" {
  name                = replace("\${local.resource_prefix}acr", "-", "")
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = false
  tags                = local.common_tags
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.api.principal_id
}

# ---------------------------------------------------------------------------
# Key Vault
# ---------------------------------------------------------------------------
data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "main" {
  name                       = "\${local.resource_prefix}-kv"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  soft_delete_retention_days = 7
  tags                       = local.common_tags
}

resource "azurerm_key_vault_access_policy" "api_identity" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_user_assigned_identity.api.principal_id

  secret_permissions = ["Get", "List"]
}

# ---------------------------------------------------------------------------
# Cosmos DB (MongoDB API)
# ---------------------------------------------------------------------------
resource "azurerm_cosmosdb_account" "main" {
  name                = "\${local.resource_prefix}-cosmos"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  offer_type          = "Standard"
  kind                = "MongoDB"
  tags                = local.common_tags

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_mongo_database" "main" {
  name                = var.project_name
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name

  autoscale_settings {
    max_throughput = var.cosmos_db_throughput
  }
}
${queueBlock}
# ---------------------------------------------------------------------------
# Container Apps Environment
# ---------------------------------------------------------------------------
resource "azurerm_log_analytics_workspace" "main" {
  name                = "\${local.resource_prefix}-law"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = "\${local.resource_prefix}-cae"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.common_tags
}

# ---------------------------------------------------------------------------
# Container App — API
# ---------------------------------------------------------------------------
resource "azurerm_container_app" "api" {
  name                         = "\${local.resource_prefix}-api"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"
  tags                         = local.common_tags

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.api.id]
  }

  registry {
    server   = azurerm_container_registry.main.login_server
    identity = azurerm_user_assigned_identity.api.id
  }

  secret {
    name  = "cosmos-connection-string"
    value = azurerm_cosmosdb_account.main.primary_mongodb_connection_string
  }
  ${queueSecretBlock}
  template {
    container {
      name   = "${projectName}-api"
      image  = var.container_image
      cpu    = var.container_app_cpu
      memory = var.container_app_memory

      env {
        name        = "MONGODB_URI"
        secret_name = "cosmos-connection-string"
      }
      env {
        name  = "NODE_ENV"
        value = var.environment
      }
      ${queueEnvBlock}
    }

    min_replicas = 1
    max_replicas = 3
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }
}
`;
}

function renderOutputs(): string {
  return `output "resource_group_name" {
  description = "Name of the Azure Resource Group."
  value       = azurerm_resource_group.main.name
}

output "container_registry_login_server" {
  description = "Login server URL for the Azure Container Registry."
  value       = azurerm_container_registry.main.login_server
}

output "container_app_url" {
  description = "Public URL of the Container App."
  value       = "https://\${azurerm_container_app.api.latest_revision_fqdn}"
}

output "cosmos_db_endpoint" {
  description = "Cosmos DB account endpoint."
  value       = azurerm_cosmosdb_account.main.endpoint
}

output "key_vault_uri" {
  description = "URI of the Azure Key Vault."
  value       = azurerm_key_vault.main.vault_uri
}

output "managed_identity_client_id" {
  description = "Client ID of the User Assigned Managed Identity."
  value       = azurerm_user_assigned_identity.api.client_id
}
`;
}
