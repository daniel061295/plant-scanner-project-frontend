/**
 * Returns the first name to address the user:
 * 1. First word of `name` (e.g. "John" from "John Doe")
 * 2. Part before '@' of the email
 * 3. Fallback string (default "User")
 */
export function getFirstName(name?: string, email?: string, fallback = 'User'): string {
    if (name) {
        const first = name.split(' ')[0].trim();
        if (first) return first;
    }
    if (email) {
        const local = email.split('@')[0].trim();
        if (local) return local;
    }
    return fallback;
}
