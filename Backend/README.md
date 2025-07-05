# Citylights Backend

A Node.js/Express backend API for the Citylights application, providing services for store management, product catalog, user authentication, and more.

## Features

- **Authentication & Authorization**: JWT-based authentication with Google OAuth support
- **Store Management**: CRUD operations for stores with image uploads
- **Product Management**: Product catalog with variations and images
- **Collection Management**: Product collections and categories
- **Review System**: User reviews and ratings
- **File Upload**: Multer-based image upload system
- **Database**: MySQL with Sequelize ORM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT, Google Auth
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Email**: Nodemailer
- **Security**: bcryptjs

## Prerequisites

- Node.js (v16 or higher)
- MySQL database
- npm or yarn package manager

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Citylights/Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env` (if available)
   - Configure the following environment variables:
     ```env
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=citylights_db
     JWT_SECRET=your_jwt_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     EMAIL_USER=your_email
     EMAIL_PASS=your_email_password
     PORT=5000
     ```

4. **Database Setup**

   ```bash
   # Run database initialization script
   node scripts/init.js
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Stores

- `GET /api/stores` - Get all stores
- `POST /api/stores` - Create new store
- `GET /api/stores/:id` - Get store by ID
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store

### Products

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Collections

- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create new collection
- `GET /api/collections/:id` - Get collection by ID
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

### Reviews

- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create new review
- `GET /api/reviews/:id` - Get review by ID
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## File Upload

The application supports file uploads for:

- Store logos and images
- Product images
- Collection images
- User profile pictures

Files are stored in the `uploads/` directory with organized subdirectories.

## Development

### Project Structure

```
Backend/
├── config/          # Database and multer configuration
├── controllers/     # Route controllers
├── middleware/      # Custom middleware (auth, etc.)
├── models/          # Sequelize models
├── routes/          # API routes
├── scripts/         # Database initialization scripts
├── uploads/         # Uploaded files
├── server.js        # Main server file
└── package.json     # Dependencies and scripts
```

### Running Tests

```bash
# Add test scripts to package.json when implementing tests
npm test
```

### Code Style

- Use ESLint for code linting
- Follow consistent naming conventions
- Add JSDoc comments for complex functions

## Deployment

1. **Build the application**

   ```bash
   npm install --production
   ```

2. **Set production environment variables**

3. **Start the server**
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team.
