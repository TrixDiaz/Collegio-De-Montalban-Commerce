# Tile Depot Mobile Admin App

A React Native mobile application for managing the Tile Depot business, built with Expo Router and TypeScript.

## Features

### Authentication

- **Email/OTP Login**: Secure authentication using email and OTP verification
- **Token Management**: Automatic token refresh and secure storage
- **Protected Routes**: Authentication-based route protection

### Dashboard

- **Overview Statistics**: Total users, products, orders, and revenue
- **Quick Actions**: Direct navigation to key management sections
- **Real-time Data**: Live updates with pull-to-refresh functionality

### Analytics

- **Performance Metrics**: Revenue, orders, users, and products statistics
- **Time Period Selection**: 7 days, 30 days, 90 days, and 1 year views
- **Top Products**: Best performing products with sales data
- **Category Distribution**: Sales breakdown by product categories
- **Recent Activity**: Latest system updates and activities

### Products Management

- **CRUD Operations**: Create, read, update, and delete products
- **Image Support**: Product thumbnails and multiple images
- **Search & Filter**: Real-time product search functionality
- **Pagination**: Efficient handling of large product catalogs
- **Product Details**: Comprehensive product information display

### Sales Management

- **Today's Summary**: Real-time sales data for current day
- **Sales by Cashier**: Individual cashier performance tracking
- **Payment Methods**: Cash, GCash, Maya, and COD breakdown
- **Transaction History**: Detailed sales records with pagination

### Users Management

- **User Directory**: Complete user listing with search
- **User Profiles**: Detailed user information and status
- **Verification Status**: User verification tracking
- **Role Management**: User role and permission management

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Language**: TypeScript
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom service layer
- **UI Components**: Custom React Native components
- **Authentication**: JWT tokens with refresh mechanism

## Project Structure

```
mobile/
├── app/                    # App screens and routing
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── analytics.tsx  # Analytics
│   │   ├── products.tsx   # Products management
│   │   ├── sales.tsx      # Sales management
│   │   └── users.tsx      # Users management
│   ├── login.tsx          # Login screen
│   ├── index.tsx          # Root redirect
│   └── _layout.tsx        # Root layout
├── components/             # Reusable components
│   └── ProtectedRoute.tsx # Route protection
├── contexts/              # React contexts
│   └── auth-context.tsx   # Authentication context
├── services/              # API services
│   └── api.ts            # API service layer
└── README.md             # This file
```

## API Integration

The mobile app integrates with the backend API through a comprehensive service layer:

### Authentication Endpoints

- `POST /api/auth/generate-otp` - Generate OTP for login
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get user profile

### Analytics Endpoints

- `GET /api/analytics/dashboard/stats` - Dashboard statistics
- `GET /api/analytics/today` - Today's sales data
- `GET /api/analytics/sales-by-cashier` - Sales by cashier
- `GET /api/analytics/sales` - Sales analytics by period
- `GET /api/analytics/products` - Product analytics
- `GET /api/analytics/category-distribution` - Category distribution
- `GET /api/analytics/recent-activity` - Recent activity feed

### Products Endpoints

- `GET /api/products` - Get products with pagination
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales Endpoints

- `GET /api/sales` - Get sales data with pagination

### Users Endpoints

- `GET /api/users` - Get users with pagination

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Expo CLI
- iOS Simulator or Android Emulator (for development)

### Installation

1. **Install dependencies**:

   ```bash
   cd mobile
   pnpm install
   ```

2. **Start the development server**:

   ```bash
   pnpm start --tunnel
   ```

3. **Run on device/simulator**:

   ```bash
   # iOS
   pnpm ios

   # Android
   pnpm android

   # Web
   pnpm web
   ```

### Configuration

1. **Backend API**: Update the `BASE_URL` in `services/api.ts` to match your backend server
2. **Authentication**: Ensure your backend is running and accessible
3. **Environment**: Set up environment variables for different deployment stages

## Features Implementation

### Authentication Flow

1. User enters email address
2. System generates and sends OTP via email
3. User enters OTP for verification
4. System returns JWT tokens for authenticated access
5. Tokens are stored securely for subsequent requests

### Data Management

- **Real-time Updates**: Pull-to-refresh on all data screens
- **Pagination**: Efficient handling of large datasets
- **Search**: Real-time search across products and users
- **Error Handling**: Comprehensive error handling with user-friendly messages

### UI/UX Features

- **Responsive Design**: Optimized for mobile devices
- **Loading States**: Visual feedback during data loading
- **Empty States**: Helpful messages when no data is available
- **Modal Dialogs**: Detailed views for products and users
- **Tab Navigation**: Easy navigation between different sections

## Security Considerations

- **Token Storage**: Secure token storage (implement AsyncStorage in production)
- **API Security**: All requests include authentication headers
- **Input Validation**: Client-side validation for all forms
- **Error Handling**: Secure error messages without sensitive information

## Future Enhancements

- **Offline Support**: Cache data for offline access
- **Push Notifications**: Real-time notifications for important updates
- **Image Upload**: Direct image upload for products
- **Advanced Analytics**: Charts and graphs for better data visualization
- **User Roles**: Role-based access control
- **Audit Logs**: Track all user actions and changes

## Development Notes

- **TypeScript**: Full type safety throughout the application
- **Error Boundaries**: Implement error boundaries for better error handling
- **Performance**: Optimize images and implement lazy loading
- **Testing**: Add unit and integration tests
- **Accessibility**: Ensure accessibility compliance

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure backend server is running and accessible
2. **Authentication**: Check token validity and refresh mechanism
3. **Image Loading**: Verify image URLs and CORS settings
4. **Navigation**: Ensure proper route configuration

### Debug Mode

Enable debug mode by setting `__DEV__` to true in development builds for additional logging and error information.

## Contributing

1. Follow TypeScript best practices
2. Maintain consistent code formatting
3. Add proper error handling
4. Include JSDoc comments for complex functions
5. Test thoroughly on both iOS and Android

## License

This project is part of the Tile Depot business management system.
