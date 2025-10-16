# Environment Setup Instructions

## Creating the .env File

Since `.env` files are gitignored for security, you need to create it manually.

### Steps:

1. Create a new file named `.env` in the project root directory:
   ```
   /Users/neel/WebstormProjects/shareDocApp/.env
   ```

2. Add the following content to the `.env` file:
   ```
   REACT_APP_API_BASE_URL=https://doc-service.navvipal.com
   ```

3. Save the file

4. **IMPORTANT**: Restart your development server for the changes to take effect:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then start it again
   npm start
   ```

## Environment Variables

### Available Variables:

- `REACT_APP_API_BASE_URL` - The base URL for the document service API
  - Production: `https://doc-service.navvipal.com`
  - Local Development: `http://localhost:3000` (if running API locally)

### Notes:

- All React environment variables must be prefixed with `REACT_APP_`
- Changes to `.env` require restarting the development server
- `.env` is gitignored to protect sensitive configuration
- Never commit `.env` files to version control

## Verification

After creating the `.env` file and restarting, the API service will use the configured base URL.

You can verify by checking the browser console - API calls should be made to:
```
https://doc-service.navvipal.com/documents/shared?share_id=...
```

## Troubleshooting

If the API still doesn't pick up the base URL:

1. Make sure the file is named exactly `.env` (not `.env.txt`)
2. Ensure there are no spaces around the `=` sign
3. Restart the development server completely
4. Check that the file is in the project root (same level as `package.json`)
5. Clear browser cache and reload



