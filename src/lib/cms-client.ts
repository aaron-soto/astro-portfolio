/**
 * Client-side CMS helper for form submissions
 * This is used in the browser for contact forms and other client-side interactions
 */

export interface FormSubmissionResult {
  success: boolean;
  submissionId?: string;
  message?: string;
  error?: string;
}

/**
 * Submit form data to CMS
 */
export async function submitForm(
  cmsDomain: string,
  projectSlug: string,
  apiKey: string,
  instanceKey: string,
  formData: Record<string, unknown>
): Promise<FormSubmissionResult> {
  try {
    // Determine protocol - if domain includes localhost or starts with localhost, use http
    const isLocal =
      cmsDomain.includes("localhost") || cmsDomain.startsWith("localhost");
    const protocol = isLocal ? "http" : "https";
    const url = `${protocol}://${cmsDomain}/api/v1/projects/${projectSlug}/submit/${instanceKey}`;

    console.log(`Submitting form to: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Form submission failed: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      submissionId: result.id,
      message: "Form submitted successfully",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Form submission failed";
    console.error("Form submission error:", error);

    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
    };
  }
}
