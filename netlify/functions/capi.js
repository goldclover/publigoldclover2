
import fetch from 'node-fetch';
import crypto from 'crypto';

export async function handler(event, context) {
  const body = JSON.parse(event.body);
  const email = body.email || '';
  const phone = body.phone || '';
  const eventName = body.eventName || 'Lead';
  const value = body.value || 1;

  const hash = (data) => crypto.createHash('sha256').update(data.toLowerCase()).digest('hex');
  const userData = { em: email ? hash(email) : undefined, ph: phone ? hash(phone) : undefined, client_user_agent: event.headers['user-agent'] };

  const payload = {
    data: [
      { event_name: eventName, event_time: Math.floor(Date.now()/1000), action_source: 'website', event_source_url: body.pageUrl, user_data: userData, custom_data: { currency:'USD', value } }
    ]
  };

  const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
  const PIXEL_ID = process.env.META_PIXEL_ID;

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const result = await response.json();
    return { statusCode: 200, body: JSON.stringify({ success:true, result }) };
  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ success:false, error: err.message }) };
  }
}
