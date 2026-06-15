# StickerSwap MVP

Mobile-first web prototype for Panini sticker album collectors.

## What is included

- Dashboard navigation for Album, Social Feed, and Chat.
- Home page with a Facebook-style collector wall and compact chat.
- Navigation for Home, Albums, Friends, Chat, and Account.
- Messenger-style floating chat button, popup chat window, and desktop right-side contact rail.
- Flexible album creation from 1 to 980 stickers.
- Optional left/right page background URLs when creating a custom album.
- Responsive virtual sticker grid with missing, owned, and duplicate states.
- World Cup 2026 album architecture from logical stickers 1-980, including opening/FWC stickers and 48 team spreads.
- Catalogue page view with Grid and album spread modes.
- Click a catalogue sticker slot once to place/own it, click again to remove it.
- Quick Add input for comma-separated sticker numbers.
- Local social feed with Global/Nearby filters, likes, comments, and city tags.
- Friends area with current friends, suggestions, and Add Friend actions.
- Account profile/settings prototype.
- Local prototype login, signup, password recovery, and admin account management pages.
- Chat prototype with Compare & Match and Confirm Trade inventory updates.

## How to run

Open `index.html` in a browser. The app stores prototype data in `localStorage`.

Admin prototype login:

- Email: `admin@stickerswap.local`
- Password: `admin123`

Password recovery is local-only for this prototype. `forgot-password.html` prepares a reset link on screen instead of sending email.

## Suggested next production step

Move this frontend into React/Next.js and connect authentication, real-time chat, image uploads, and live feed data with Firebase or Supabase.
