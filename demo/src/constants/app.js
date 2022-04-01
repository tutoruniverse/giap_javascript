export const EventName = {
  ASK: 'Ask',
  SIGN_UP: 'Sign Up',
  VISIT: 'Visit',
};

export const GIAP_API_URL = import.meta.env.VITE_APP_GIAP_API_URL;

export const GIAP_TOKEN = import.meta.env.VITE_APP_GIAP_TOKEN;

if (!GIAP_API_URL || !GIAP_TOKEN) {
  throw new Error(
    'Please update VITE_APP_GIAP_API_URL and VITE_APP_GIAP_TOKEN to .env.local in the directory `demo`.',
  );
}
