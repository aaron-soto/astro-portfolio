/**
 * AyeZee Form Handler
 *
 * Reusable form submission handler with:
 * - Validation
 * - Loading states
 * - Error handling
 * - Honeypot spam prevention
 * - Cloudflare Turnstile support
 */

export interface FormConfig {
  apiUrl: string;
  apiKey: string;
  honeypotField?: string;
  turnstileEnabled?: boolean;
  turnstileSiteKey?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export interface ValidationRule {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label?: string;
  rules?: ValidationRule;
}

export class FormHandler {
  private config: FormConfig;
  private formElement: HTMLFormElement;
  private fields: Map<string, FormField> = new Map();
  private turnstileWidget: string | null = null;

  constructor(formElement: HTMLFormElement, config: FormConfig) {
    this.formElement = formElement;
    this.config = {
      honeypotField: 'website',
      ...config,
    };

    this.initialize();
  }

  /**
   * Register a field with validation rules
   */
  public registerField(field: FormField): void {
    this.fields.set(field.name, field);
  }

  /**
   * Initialize the form handler
   */
  private initialize(): void {
    // Mark form as initialized
    if (this.formElement.hasAttribute('data-form-initialized')) {
      return;
    }
    this.formElement.setAttribute('data-form-initialized', 'true');

    // Render Turnstile if enabled
    if (this.config.turnstileEnabled && this.config.turnstileSiteKey) {
      this.renderTurnstile();
    }

    // Attach submit handler
    this.formElement.addEventListener('submit', this.handleSubmit.bind(this));
  }

  /**
   * Render Cloudflare Turnstile widget
   */
  private renderTurnstile(): void {
    // Create container if it doesn't exist
    let container = this.formElement.querySelector('.cf-turnstile-container') as HTMLElement;
    if (!container) {
      container = document.createElement('div');
      container.className = 'cf-turnstile-container';

      // Insert before submit button
      const submitButton = this.formElement.querySelector('[type="submit"]');
      if (submitButton) {
        submitButton.parentElement?.insertBefore(container, submitButton);
      } else {
        this.formElement.appendChild(container);
      }
    }

    // Wait for Turnstile script to load
    if (typeof (window as any).turnstile !== 'undefined') {
      this.turnstileWidget = (window as any).turnstile.render(container, {
        sitekey: this.config.turnstileSiteKey!,
        theme: 'light',
        size: 'normal',
      });
    } else {
      console.warn('Turnstile script not loaded. Make sure to include the Turnstile script in your page.');
    }
  }

  /**
   * Validate a single field
   */
  private validateField(name: string, value: any): string | null {
    const field = this.fields.get(name);
    if (!field || !field.rules) return null;

    const rules = field.rules;
    const label = field.label || name;

    // Required check
    if (rules.required && (!value || value.toString().trim() === '')) {
      return `${label} is required`;
    }

    // Email validation
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return `Please enter a valid email address`;
      }
    }

    // Min length
    if (rules.minLength && value && value.length < rules.minLength) {
      return `${label} must be at least ${rules.minLength} characters`;
    }

    // Max length
    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `${label} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern
    if (rules.pattern && value && !rules.pattern.test(value)) {
      return `${label} format is invalid`;
    }

    // Custom validation
    if (rules.custom && value) {
      const result = rules.custom(value);
      if (result !== true) {
        return typeof result === 'string' ? result : `${label} is invalid`;
      }
    }

    return null;
  }

  /**
   * Validate all form fields
   */
  private validate(formData: FormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    for (const [name, field] of this.fields) {
      const value = formData.get(name);
      const error = this.validateField(name, value);
      if (error) {
        errors[name] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Get Turnstile token
   */
  private getTurnstileToken(): string | null {
    if (!this.config.turnstileEnabled || !this.turnstileWidget) {
      return null;
    }

    try {
      return (window as any).turnstile.getResponse(this.turnstileWidget);
    } catch (error) {
      console.error('Failed to get Turnstile token:', error);
      return null;
    }
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    // Get form data
    const formData = new FormData(this.formElement);
    const data = Object.fromEntries(formData.entries());

    // Honeypot check - silently reject spam
    if (this.config.honeypotField && data[this.config.honeypotField]) {
      // Fake success to fool bots
      await this.delay(1000);
      this.config.onSuccess?.(data);
      this.formElement.reset();
      return;
    }

    // Validate form
    const validation = this.validate(formData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      this.config.onError?.(firstError);
      return;
    }

    // Check Turnstile token if enabled
    if (this.config.turnstileEnabled) {
      const turnstileToken = this.getTurnstileToken();
      if (!turnstileToken) {
        this.config.onError?.('Please complete the security verification');
        return;
      }
      // Add token to submission data
      (data as any)['cf-turnstile-response'] = turnstileToken;
    }

    // Set loading state
    this.config.onLoadingChange?.(true);

    try {
      // Submit to API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      if (response.ok && result.success) {
        this.config.onSuccess?.(result.data);
        this.formElement.reset();

        // Reset Turnstile if enabled
        if (this.config.turnstileEnabled && this.turnstileWidget) {
          (window as any).turnstile?.reset(this.turnstileWidget);
        }
      } else {
        // Handle API errors
        const errorMessage = this.parseApiError(result);
        this.config.onError?.(errorMessage);

        // Reset Turnstile on error
        if (this.config.turnstileEnabled && this.turnstileWidget) {
          (window as any).turnstile?.reset(this.turnstileWidget);
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        this.config.onError?.('Request timeout. Please try again.');
      } else {
        this.config.onError?.('Network error. Please check your connection and try again.');
      }

      // Reset Turnstile on error
      if (this.config.turnstileEnabled && this.turnstileWidget) {
        (window as any).turnstile?.reset(this.turnstileWidget);
      }
    } finally {
      this.config.onLoadingChange?.(false);
    }
  }

  /**
   * Parse API error response
   */
  private parseApiError(result: any): string {
    if (!result.error) {
      return 'Failed to send message. Please try again.';
    }

    if (result.code === 'VALIDATION_ERROR' && result.details) {
      const details = typeof result.details === 'string'
        ? JSON.parse(result.details)
        : result.details;

      if (details.validationErrors) {
        return `Validation error: ${details.validationErrors.join(', ')}`;
      } else if (details.missingFields) {
        return `Missing required fields: ${details.missingFields.join(', ')}`;
      }
    }

    const configErrors = ['API_KEY_MISSING', 'INVALID_CREDENTIALS', 'MODULE_NOT_FOUND'];
    if (configErrors.includes(result.code)) {
      return 'Contact form configuration error. Please try again later.';
    }

    return result.error;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Destroy the form handler and clean up
   */
  public destroy(): void {
    this.formElement.removeEventListener('submit', this.handleSubmit.bind(this));

    if (this.config.turnstileEnabled && this.turnstileWidget) {
      try {
        (window as any).turnstile?.remove(this.turnstileWidget);
      } catch (error) {
        console.error('Failed to remove Turnstile widget:', error);
      }
    }

    this.formElement.removeAttribute('data-form-initialized');
  }
}

/**
 * Helper function to create a form handler with common UI bindings
 */
export function createFormHandler(
  formId: string,
  config: FormConfig,
  uiElements?: {
    submitButton?: HTMLButtonElement;
    buttonText?: HTMLElement;
    buttonSpinner?: HTMLElement;
    messageContainer?: HTMLElement;
  }
): FormHandler | null {
  const form = document.getElementById(formId) as HTMLFormElement;
  if (!form) {
    console.error(`Form with id "${formId}" not found`);
    return null;
  }

  const handler = new FormHandler(form, {
    ...config,
    onLoadingChange: (isLoading) => {
      if (uiElements?.submitButton) {
        uiElements.submitButton.disabled = isLoading;
      }
      if (uiElements?.buttonText && uiElements?.buttonSpinner) {
        if (isLoading) {
          uiElements.buttonText.classList.add('hidden');
          uiElements.buttonSpinner.classList.remove('hidden');
          uiElements.buttonSpinner.classList.add('flex');
        } else {
          uiElements.buttonText.classList.remove('hidden');
          uiElements.buttonSpinner.classList.add('hidden');
          uiElements.buttonSpinner.classList.remove('flex');
        }
      }
      config.onLoadingChange?.(isLoading);
    },
    onSuccess: (data) => {
      if (uiElements?.messageContainer) {
        showMessage(
          uiElements.messageContainer,
          "Message sent successfully! We'll get back to you soon. Thank you!",
          true
        );
      }
      config.onSuccess?.(data);
    },
    onError: (error) => {
      if (uiElements?.messageContainer) {
        showMessage(uiElements.messageContainer, error, false);
      }
      config.onError?.(error);
    },
  });

  return handler;
}

/**
 * Show a message in a container
 */
function showMessage(container: HTMLElement, message: string, isSuccess: boolean): void {
  container.textContent = message;
  container.classList.remove('hidden');

  if (isSuccess) {
    container.classList.remove('border-red-300', 'bg-red-50', 'text-red-700');
    container.classList.add('border-green-300', 'bg-green-50', 'text-green-700');
  } else {
    container.classList.remove('border-green-300', 'bg-green-50', 'text-green-700');
    container.classList.add('border-red-300', 'bg-red-50', 'text-red-700');
  }
}
