# Firebase Hosting Setup Notes

## Quick Setup

1. Create Firebase project at: https://console.firebase.google.com
2. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-actual-project-id"
     }
   }
   ```

3. Or run: `firebase use your-project-id`

## Deploy Commands

```bash
# Login (first time)
firebase login

# Build frontend
npm run build

# Deploy
firebase deploy --only hosting
```

## Custom Domain

1. In Firebase Console → Hosting → Add custom domain
2. Enter: `restaurant.zyshaire.com`
3. Add DNS records in Hostinger (Firebase will show you what to add)
4. SSL is automatically provisioned!
