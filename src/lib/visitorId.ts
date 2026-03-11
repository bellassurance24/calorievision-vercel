/**
 * Generates and stores a unique visitor ID for anonymous device tracking.
 * This ID persists across sessions using localStorage.
 */

const VISITOR_ID_KEY = 'cv_visitor_id';

function generateVisitorId(): string {
  // Generate a UUID v4-like string
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return generateVisitorId();
  }
  
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  
  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  
  return visitorId;
}

export function clearVisitorId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VISITOR_ID_KEY);
  }
}
