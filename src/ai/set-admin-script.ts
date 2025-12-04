/**
 * This is a one-time script to grant admin privileges to a user.
 * Run this script with `npm run set-admin`
 */
import { setAdmin } from '@/ai/flows/set-admin';

const uid = '1d54RntVoYRPOlEpuS5AxuvKLKC3';

console.log(`Attempting to make user with UID: ${uid} an admin...`);

setAdmin({ uid })
  .then((result) => {
    console.log(result);
    if (result.success) {
      console.log('✅ Success! User is now an admin.');
    } else {
      console.error('❌ Failure! Could not set admin.', result.message);
    }
  })
  .catch(console.error)
  .finally(() => process.exit(0));
