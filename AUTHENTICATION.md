# Adding Authentication to the Online Petition Platform

This guide explains how to integrate the authentication feature into your existing Online Petition Platform.

## Prerequisites

Before integrating authentication, make sure your project is working correctly without authentication.

## Backend Setup

1. Install the required dependencies:
```
npm install jsonwebtoken bcryptjs
```

2. Review the `auth-module.js` file to understand the authentication implementation.

3. Modify your existing `mock-server.js` file by adding the necessary code from `auth-module.js`. This includes:
   - Adding JWT and bcryptjs imports
   - Adding the JWT secret key
   - Adding users in-memory storage
   - Adding the authenticateToken middleware
   - Adding sample user creation
   - Adding authentication routes (register, login, me)
   - Updating existing routes to use the authenticateToken middleware

## Frontend Setup

### 1. Create the Authentication Context

Copy the `AuthContext.jsx` file to your project's `src/context` directory:
```
mkdir -p frontend/src/context
cp frontend/src/context/AuthContext.jsx frontend/src/context/
```

### 2. Add Authentication Components

Copy the authentication-related components to your project:
```
cp frontend/src/components/LoginForm.jsx frontend/src/components/
cp frontend/src/components/RegisterForm.jsx frontend/src/components/
cp frontend/src/components/ProtectedRoute.jsx frontend/src/components/
cp frontend/src/pages/LoginPage.jsx frontend/src/pages/
cp frontend/src/pages/RegisterPage.jsx frontend/src/pages/
```

### 3. Update Your App Component

Modify your existing `App.jsx` file by referring to `App.auth.example.jsx`:
- Import the new authentication components and context
- Wrap your application with the `AuthProvider`
- Add routes for login and register pages
- Protect routes that require authentication using the `ProtectedRoute` component

### 4. Update Your Navbar

Modify your existing `Navbar.jsx` file by referring to `Navbar.auth.example.jsx`:
- Add authentication-related menu items
- Show different options for authenticated vs. unauthenticated users
- Display the current user's information when logged in

## Testing Authentication

1. Start your backend server:
```
node mock-server.js
```

2. Start your frontend application:
```
cd frontend
npm start
```

3. Test the authentication features:
   - Register a new account
   - Log in with your account
   - Create a petition (requires authentication)
   - Log out

## Additional Features

Once basic authentication is working, you can extend it with:

1. **User Profile Page**: Allow users to view and edit their profiles
2. **My Petitions Page**: Show users the petitions they've created
3. **My Signatures Page**: Show users the petitions they've signed
4. **Admin Dashboard**: For managing petitions and users (advanced)

## Security Considerations

This implementation is for demonstration purposes only. In a production environment, you should:

1. Use HTTPS to secure data transmission
2. Store passwords securely (this example uses bcrypt)
3. Implement token refresh mechanisms
4. Set appropriate token expiration times
5. Use environment variables for sensitive values (like JWT_SECRET)
6. Implement rate limiting to prevent brute-force attacks

## Troubleshooting

If you encounter issues:

1. Check browser console for frontend errors
2. Check server console for backend errors
3. Verify that JWT tokens are being stored and sent correctly
4. Ensure authentication middleware is applied to the correct routes 