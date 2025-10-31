/**
 * AyeZee CMS Helper - Astro/Cloudflare Pages Version
 *
 * A simple helper to fetch data from your AyeZee Dashboard CMS
 * Drop this file into your Astro project and use the provided functions
 *
 * Required Environment Variables:
 * - PUBLIC_AYEZEE_API_KEY: Your project's API key (starts with AZ_) - only needed for form submissions
 * - PUBLIC_CMS_DOMAIN: Domain where your CMS is hosted (e.g., localhost:3000 or cms.yoursite.com)
 * - PUBLIC_PROJECT_SLUG: Your project's slug identifier
 *
 * Optional Environment Variables:
 * - PUBLIC_INSTANCE_KEY: Default instance key for single-module projects
 */

// Environment variables interface for Astro
interface ImportMetaEnv {
  readonly PUBLIC_AYEZEE_API_KEY?: string;
  readonly PUBLIC_CMS_DOMAIN?: string;
  readonly PUBLIC_PROJECT_SLUG?: string;
  readonly PUBLIC_INSTANCE_KEY?: string;
}

// Extend the ImportMetaEnv interface instead of redeclaring ImportMeta
interface ImportMetaEnv {
  readonly PUBLIC_AYEZEE_API_KEY?: string;
  readonly PUBLIC_CMS_DOMAIN?: string;
  readonly PUBLIC_PROJECT_SLUG?: string;
  readonly PUBLIC_INSTANCE_KEY?: string;
}

// Types for the API responses
export interface ModuleField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: unknown[];
  validation?: unknown;
}

export interface Module {
  id: string;
  instanceKey: string;
  label: string;
  dataType: "collection" | "singleton" | "submissions";
  category: string;
  description?: string;
  icon?: string;
  fields: ModuleField[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleDataItem {
  id: string;
  data: Record<string, unknown>;
  sortOrder?: number;
  status?: string; // For submissions
  ipAddress?: string; // For submissions
  userAgent?: string; // For submissions
  createdAt: string;
  updatedAt?: string;
}

export interface ModuleDataResponse {
  data: ModuleDataItem[];
  pagination: {
    total: number;
    limit?: number | null;
    offset?: number;
    count: number;
  };
  module: {
    instanceKey: string;
    label: string;
    dataType: string;
    category: string;
  };
}

export interface ProjectModulesResponse {
  project: {
    id: string;
    slug: string;
    name: string;
    domain?: string;
  };
  modules: Module[];
}

// API Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Configuration class
class AyeZeeCMS {
  private apiKey: string;
  private cmsDomain: string;
  private projectSlug: string;
  private defaultInstanceKey?: string;

  constructor() {
    this.apiKey = import.meta.env.PUBLIC_AYEZEE_API_KEY || "";
    this.cmsDomain = import.meta.env.PUBLIC_CMS_DOMAIN || "";
    this.projectSlug = import.meta.env.PUBLIC_PROJECT_SLUG || "";
    this.defaultInstanceKey = import.meta.env.PUBLIC_INSTANCE_KEY || undefined;

    if (!this.cmsDomain) {
      throw new Error("PUBLIC_CMS_DOMAIN environment variable is required");
    }
    if (!this.projectSlug) {
      throw new Error("PUBLIC_PROJECT_SLUG environment variable is required");
    }
  }

  private getBaseUrl(): string {
    const protocol = this.cmsDomain.includes("localhost") ? "http" : "https";
    return `${protocol}://${this.cmsDomain}/api/v1/projects/${this.projectSlug}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = false
  ): Promise<T> {
    const url = `${this.getBaseUrl()}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Only add auth header if required (for form submissions)
    if (requiresAuth) {
      if (!this.apiKey) {
        throw new Error(
          "PUBLIC_AYEZEE_API_KEY environment variable is required for this operation"
        );
      }
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `AyeZee CMS API error: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as ApiResponse<T>;

    if (!result.success) {
      throw new Error(`API Error: ${result.message || "Unknown error"}`);
    }

    return result.data;
  }

  /**
   * Get all modules for this project
   */
  async getModules(): Promise<ProjectModulesResponse> {
    return this.makeRequest<ProjectModulesResponse>("/modules");
  }

  /**
   * Get a specific module by instance key
   */
  async getModule(instanceKey: string): Promise<Module | null> {
    const { modules } = await this.getModules();
    return modules.find((module) => module.instanceKey === instanceKey) || null;
  }

  /**
   * Get all data for a specific module
   */
  async getModuleData(
    instanceKey: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ModuleDataResponse> {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/modules/${instanceKey}/data${queryString ? `?${queryString}` : ""}`;

    return this.makeRequest<ModuleDataResponse>(endpoint);
  }

  /**
   * Get all data for the default instance (if PUBLIC_INSTANCE_KEY is set)
   */
  async getDefaultModuleData(
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ModuleDataResponse> {
    if (!this.defaultInstanceKey) {
      throw new Error(
        "No default instance key set. Set PUBLIC_INSTANCE_KEY or use getModuleData() with a specific instance key."
      );
    }
    return this.getModuleData(this.defaultInstanceKey, options);
  }

  /**
   * Submit data to a form module (submissions type)
   * This requires API key authentication
   */
  async submitForm(
    instanceKey: string,
    formData: Record<string, unknown>
  ): Promise<{
    success: boolean;
    submissionId?: string;
    message?: string;
  }> {
    try {
      const response = await this.makeRequest<{ id: string }>(
        `/submit/${instanceKey}`,
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        true // Requires authentication
      );

      return {
        success: true,
        submissionId: response.id,
        message: "Form submitted successfully",
      };
    } catch (error) {
      console.error("Form submission error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Form submission failed",
      };
    }
  }

  /**
   * Submit to the default form instance (if PUBLIC_INSTANCE_KEY is set)
   */
  async submitDefaultForm(formData: Record<string, unknown>): Promise<{
    success: boolean;
    submissionId?: string;
    message?: string;
  }> {
    if (!this.defaultInstanceKey) {
      throw new Error(
        "No default instance key set. Set PUBLIC_INSTANCE_KEY or use submitForm() with a specific instance key."
      );
    }
    return this.submitForm(this.defaultInstanceKey, formData);
  }

  /**
   * Get modules by category (e.g., 'forms', 'content', 'media')
   */
  async getModulesByCategory(category: string): Promise<Module[]> {
    const { modules } = await this.getModules();
    return modules.filter((module) => module.category === category);
  }

  /**
   * Get modules by data type ('collection', 'singleton', 'submissions')
   */
  async getModulesByDataType(
    dataType: "collection" | "singleton" | "submissions"
  ): Promise<Module[]> {
    const { modules } = await this.getModules();
    return modules.filter((module) => module.dataType === dataType);
  }

  /**
   * Helper to get all form modules (submissions type)
   */
  async getForms(): Promise<Module[]> {
    return this.getModulesByDataType("submissions");
  }

  /**
   * Helper to get all content collections
   */
  async getCollections(): Promise<Module[]> {
    return this.getModulesByDataType("collection");
  }

  /**
   * Helper to get all singleton content
   */
  async getSingletons(): Promise<Module[]> {
    return this.getModulesByDataType("singleton");
  }
}

// Create and export a singleton instance
export const cms = new AyeZeeCMS();

// Export convenience functions for common use cases
export const getModules = () => cms.getModules();
export const getModule = (instanceKey: string) => cms.getModule(instanceKey);
export const getModuleData = (
  instanceKey: string,
  options?: { limit?: number; offset?: number }
) => cms.getModuleData(instanceKey, options);
export const getDefaultModuleData = (options?: {
  limit?: number;
  offset?: number;
}) => cms.getDefaultModuleData(options);
export const submitForm = (
  instanceKey: string,
  formData: Record<string, unknown>
) => cms.submitForm(instanceKey, formData);
export const submitDefaultForm = (formData: Record<string, unknown>) =>
  cms.submitDefaultForm(formData);
export const getForms = () => cms.getForms();
export const getCollections = () => cms.getCollections();
export const getSingletons = () => cms.getSingletons();

// Export the class for advanced usage
export { AyeZeeCMS };
