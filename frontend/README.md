# Citylights Frontend

A modern React application for the Citylights platform, providing an intuitive user interface for browsing stores, products, and managing user interactions.

## Features

- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Store Browsing**: Browse and search through stores
- **Product Catalog**: View products with detailed information
- **User Authentication**: Login/register with Google OAuth support
- **Dashboard**: Admin dashboard for store and product management
- **Reviews & Ratings**: User review system
- **Search & Filtering**: Advanced search and filter capabilities
- **Interactive Maps**: Store locator functionality

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Custom components with CSS
- **Icons**: Lucide React, React Icons
- **Animations**: Lottie Files
- **Notifications**: React Toastify
- **Form Handling**: React Select

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API running (see Backend README)

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Citylights/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Create a `.env` file in the frontend directory
   - Configure the following environment variables:
     ```env
     VITE_API_URL=http://localhost:5000/api
     VITE_GOOGLE_CLIENT_ID=your_google_client_id
     ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, icons, and static files
│   │   ├── common/      # Common UI components
│   │   └── dashboard/   # Dashboard-specific components
│   ├── pages/           # Page components
│   │   └── dashboard/   # Dashboard pages
│   ├── services/        # API service functions
│   ├── styles/          # CSS files
│   │   ├── common/      # Common styles
│   │   ├── component/   # Component-specific styles
│   │   ├── dashboard/   # Dashboard styles
│   │   └── pages/       # Page-specific styles
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Key Components

### Common Components

- `Button.jsx` - Reusable button component
- `InputField.jsx` - Form input component
- `Modal.jsx` - Modal dialog component
- `SearchBar.jsx` - Search functionality
- `Table.jsx` - Data table component
- `Pagination.jsx` - Pagination controls

### Pages

- `Home.jsx` - Landing page
- `Products.jsx` - Product listing page
- `Productdetail.jsx` - Product detail page
- `Store.jsx` - Store listing page
- `StoreDetails.jsx` - Store detail page
- `Collection.jsx` - Collection page
- `Aboutus.jsx` - About page
- `Contact.jsx` - Contact page
- `Policy.jsx` - Policy page
- `login.jsx` - Authentication page

### Dashboard Pages

- `index.jsx` - Dashboard overview
- `products.jsx` - Product management
- `stores.jsx` - Store management
- `collections.jsx` - Collection management
- `users.jsx` - User management
- `orders.jsx` - Order management
- `reviews.jsx` - Review management
- `reports.jsx` - Analytics and reports
- `settings.jsx` - Application settings

## API Integration

The frontend communicates with the backend API through service functions located in `src/services/`:

- `adminService.js` - Admin-specific API calls
- `publicService.js` - Public API calls

## Styling

The application uses a modular CSS approach with:

- Global styles in `index.css`
- Component-specific styles in `styles/` directory
- Responsive design principles
- Modern CSS features (Grid, Flexbox, Custom Properties)

## Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use consistent naming conventions
- Add PropTypes for component validation

### Component Structure

```jsx
import React from "react";
import "./ComponentName.css";

const ComponentName = ({ prop1, prop2 }) => {
  // Component logic here

  return <div className="component-name">{/* JSX content */}</div>;
};

export default ComponentName;
```

### State Management

- Use React hooks (useState, useEffect, useContext)
- Keep state as local as possible
- Use context for global state when needed

## Building for Production

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Preview the build**

   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimization

- Code splitting with React Router
- Lazy loading of components
- Image optimization
- Bundle size optimization with Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
