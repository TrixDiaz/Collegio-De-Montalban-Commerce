/**
 * Utility functions for Tauri integration
 */

/**
 * Check if the app is running in Tauri mode
 * @returns {boolean} True if running in Tauri, false otherwise
 */
export const isTauri = (): boolean => {
    return typeof window !== 'undefined' && '__TAURI__' in window;
};

/**
 * Check if the app is running in development mode
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = (): boolean => {
    return import.meta.env.DEV;
};

/**
 * Check if the app is running in production mode
 * @returns {boolean} True if in production mode
 */
export const isProduction = (): boolean => {
    return import.meta.env.PROD;
};

/**
 * Get the platform the app is running on (only available in Tauri)
 * @returns {Promise<string | null>} Platform name or null if not in Tauri
 */
export const getPlatform = async (): Promise<string | null> => {
    if (!isTauri()) {
        return null;
    }

    try {
        const { platform } = await import('@tauri-apps/plugin-os');
        return await platform();
    } catch (error) {
        console.warn('Failed to get platform:', error);
        return null;
    }
};

/**
 * Show a native notification (only works in Tauri)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<boolean>} True if notification was sent successfully
 */
export const showNotification = async (title: string, body: string): Promise<boolean> => {
    if (!isTauri()) {
        console.warn('Notifications only work in Tauri mode');
        return false;
    }

    try {
        const { sendNotification } = await import('@tauri-apps/plugin-notification');
        await sendNotification({
            title,
            body,
        });
        return true;
    } catch (error) {
        console.error('Failed to send notification:', error);
        return false;
    }
};

/**
 * Open a file dialog (only works in Tauri)
 * @param {object} options - Dialog options
 * @returns {Promise<string | string[] | null>} Selected file path(s) or null
 */
export const openFileDialog = async (options?: {
    multiple?: boolean;
    filters?: Array<{ name: string; extensions: string[] }>;
}): Promise<string | string[] | null> => {
    if (!isTauri()) {
        console.warn('File dialog only works in Tauri mode');
        return null;
    }

    try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        return await open({
            multiple: options?.multiple ?? false,
            filters: options?.filters,
        });
    } catch (error) {
        console.error('Failed to open file dialog:', error);
        return null;
    }
};
