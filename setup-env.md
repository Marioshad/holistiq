# Environment Variables Setup

## Create `.env` file

Create a `.env` file in your project root with the following content:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key_here
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
FIREBASE_PROJECT_ID=your_firebase_project_id_here
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
FIREBASE_APP_ID=your_firebase_app_id_here

# Development Configuration
# Set to 'true' to enable development screens (FormComponents, StyleGuide, etc.)
# Set to 'false' or remove for production builds
ENABLE_DEV_SCREENS=true
```

## Development vs Production

### Development Build
```env
ENABLE_DEV_SCREENS=true
```
- Shows Form Components screen
- Shows Style Guide screen
- Shows Auth Debug screen
- Shows Notification Test screen

### Production Build
```env
ENABLE_DEV_SCREENS=false
```
- Hides all development screens
- Cleaner navigation
- Smaller app size
- Better user experience

## How It Works

1. **Conditional Imports**: Development screens are only imported when `ENABLE_DEV_SCREENS=true`
2. **Conditional Navigation**: Development screens only appear in drawer when enabled
3. **Build Optimization**: Unused code is excluded from production builds

## Build Commands

### Development
```bash
# Development with dev screens
ENABLE_DEV_SCREENS=true npx expo start

# Or set in .env file and run
npx expo start
```

### Production
```bash
# Production without dev screens
ENABLE_DEV_SCREENS=false npx expo build

# Or remove ENABLE_DEV_SCREENS from .env file
npx expo build
```

## Screens Affected

- ✅ FormComponentsScreen
- ✅ StyleGuideScreen  
- ✅ AuthDebugScreen
- ✅ NotificationTestScreen

## Benefits

- **Cleaner Production App**: No development tools visible to users
- **Smaller Bundle Size**: Development screens excluded from production
- **Better UX**: Users only see relevant screens
- **Easy Toggle**: Simple environment variable control 