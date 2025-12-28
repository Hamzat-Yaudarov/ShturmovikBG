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
      return res.status(401).json({ error: 'No initialization data' });
    }

    // Parse the init data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    
    // Remove hash from params for verification
    params.delete('hash');

    // Create data check string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Verify using HMAC (Telegram format)
    const secret = crypto
      .createHmac('sha256', process.env.BOT_TOKEN)
      .update('WebAppData')
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secret)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse user data
    const userJson = params.get('user');
    const user = JSON.parse(userJson);

    req.user = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      photoUrl: user.photo_url
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
