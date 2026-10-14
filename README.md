# KIRUU FASHION STORE

Premium responsive fashion storefront with cinematic intro animation, collection browsing, search, wishlist, animated cart drawer, customer sign-in/sign-up UI, and product admin panel. All project files are kept in the repository root.

## Files
- `index.html`, `style.css`, `app.js` — storefront and shopping interactions
- `login.html`, `login.js` — sign-in/sign-up interface
- `admin.html`, `admin.css`, `admin.js` — admin product dashboard
- `server.js` — Express API and admin routes
- `products.json` — product catalogue
- `package.json` — Node dependencies and start script

## Run locally
1. Install Node.js 18 or newer.
2. Run `npm install`.
3. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and a strong `SESSION_SECRET` environment variable.
4. Run `npm start`.
5. Open `/` for the store and `/admin` for the admin panel.

## Important deployment notes
This project includes an Express server. Uploading the files as a static Netlify Drop site will not run `server.js` or its `/api/products` and `/api/admin/*` routes. For a Netlify deployment, the API must be adapted to Netlify Functions and product persistence must use a durable database/storage service. For a Node-compatible host, configure the environment variables above. The current customer login/signup page is a designed UI and intentionally does not pretend to authenticate customers; connect a secure authentication provider/backend before taking real customer accounts or orders. The cart and wishlist are currently saved in the visitor's browser.

Product image URLs currently use external image hosting. Admin uploads are saved on the server filesystem; use durable object storage for production hosting where local files may be ephemeral. Never publish admin passwords or secret keys in frontend files.
