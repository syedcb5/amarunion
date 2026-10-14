// Pick ONE backend:
//   api         : 'api.php' -> your own PHP hosting with a SQLite database (no Supabase, no external service). See docs/SETUP-BN.md.
//   supabaseUrl : https://xxxxxxxx.supabase.co  + supabaseKey: the "anon public" key (Supabase cloud).
//   siteUrl     : optional, e.g. https://amarunion.org/  (used inside admit-card QR codes)
// Leave api AND supabaseUrl/supabaseKey EMPTY to run in LOCAL TEST MODE: data stays in this browser only,
// with demo data, and the website and admin panel share it when served from the same origin.
window.AU_CONFIG={api:'api.php',supabaseUrl:'',supabaseKey:'',siteUrl:''};
