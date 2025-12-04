/**
 * This is a one-time script to grant admin privileges to a user.
 * Run this script with `npm run set-admin`
 */
import { setAdmin } from '@/ai/flows/set-admin';

// Important: Make sure this UID is correct for the user you want to make an admin.
const uid = '1d54RntVoYRPOlEpuS5AxuvKLKC3';

console.log(`Attempting to make user with UID: ${uid} an admin...`);

setAdmin({ uid })
  .then((result) => {
    if (result.success) {
      console.log('✅ Success! User is now an admin.');
      console.log('Please log out and log back in to access the admin panel.');
    } else {
      console.error('❌ Failure! Could not set admin.', result.message);
      console.error('Please ensure your `.env` file contains a valid `FIREBASE_SERVICE_ACCOUNT_KEY`.');
    }
  })
  .catch((error) => {
      console.error("An unexpected error occurred:", error)
  })
  .finally(() => {
    // We use a small delay to ensure logs are flushed before exiting.
    setTimeout(() => process.exit(0), 100);
  });
