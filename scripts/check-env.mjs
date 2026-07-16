const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "KMI_STAFF_EMAILS",
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`Environment ready: ${required.length} required variables are present.`);
}

const givingKeys = ["KMI_CARD_GIVING_URL", "KMI_BANK_GIVING_DETAILS", "KMI_GCASH_GIVING_DETAILS"];
if (!givingKeys.some((key) => process.env[key]?.trim())) {
  console.error(`Missing a verified giving method: configure at least one of ${givingKeys.join(", ")}.`);
  process.exitCode = 1;
} else {
  console.log("Giving ready: at least one verified method is configured.");
}
