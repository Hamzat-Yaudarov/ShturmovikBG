import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Verify Telegram Mini App data
 * Based on Telegram documentation:
 * https://core.telegram.org/bots/webapps#validating-data-received-from-the-web-app
 */
export function verifyTelegramData(req, res, next) {
  try {
    const initData = req.headers['x-telegram-init-data'];

    if (!initData) {
      console.warn('⚠️ No Telegram init data header received');
      return res.status(401).json({ error: 'No initialization data' });
    }

    // Parse the init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      console.error('❌ No hash in init data');
      return res.status(401).json({ error: 'Invalid init data - missing hash' });
    }

    // Remove hash from params for verification
    params.delete('hash');

    // Create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Verify using HMAC
    const secret = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secret)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      console.error('❌ Signature validation failed');
      console.error('Expected:', hash);
      console.error('Got:', calculatedHash);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse user data
    const userJson = params.get('user');
    if (!userJson) {
      console.error('❌ No user data in init data');
      return res.status(401).json({ error: 'No user data' });
    }

    const user = JSON.parse(userJson);

    req.user = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      photoUrl: user.photo_url
    };

    console.log(`✓ Auth verified for user ${req.user.id}`);
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
}
