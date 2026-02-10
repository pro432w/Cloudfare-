import { Hono } from 'hono'

// Types define kora jate Typescript bujhte pare variables gulo ache
type Bindings = {
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Helper function: Telegram Message Pathano
async function sendLog(env: Bindings, req: Request, status: number) {
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHAT_ID

  if (!token || !chatId) return console.log("Missing Secrets!")

  const ip = req.headers.get('CF-Connecting-IP') || 'Hidden'
  const city = (req as any).cf?.city || 'Unknown City'
  const country = (req as any).cf?.country || 'Unknown Country'
  
  const text = `
🔔 <b>New Visitor!</b>
------------------
🌍 <b>Location:</b> ${city}, ${country}
💻 <b>IP:</b> ${ip}
✅ <b>Status:</b> ${status}
  `

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  })
}

app.get('/', (c) => {
  // Background e Telegram e log pathano (WaitUntil use kora hoy jate site slow na hoy)
  c.executionCtx.waitUntil(sendLog(c.env, c.req.raw, 200))

  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Secure App</title>
      <style>
        body { background: #111; color: #eee; font-family: sans-serif; display: flex; height: 100vh; justify-content: center; align-items: center; }
        .card { background: #222; padding: 2rem; border-radius: 1rem; border: 1px solid #333; text-align: center; }
        h1 { color: #4ade80; margin-bottom: 0.5rem; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>System Secure</h1>
        <p>Your visit has been logged silently.</p>
        <p style="font-size: 0.8rem; color: #666; margin-top: 1rem;">Powered by Cloudflare Workers</p>
      </div>
    </body>
    </html>
  `)
})

export default app
                       
