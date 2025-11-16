# React Implementation for BTEA Outlet Form

This document explains the React implementation of the BTEA Web Portal outlet form with improved UX and modern patterns.

## 🚀 Features

### 1. **Session Management**
- Auto-logout warning with countdown timer
- Session extension with heartbeat mechanism
- Visual countdown display
- Automatic session refresh

### 2. **Outlet Form**
- Modern React hooks-based architecture
- Real-time form validation
- Conditional field rendering
- File upload with validation
- Multi-step form logic

### 3. **Improved UX**
- Inline error messages
- Visual feedback on interactions
- Responsive design
- Accessible form controls
- Loading states

## 📁 Project Structure

```
BTEA-Web-Portal/
├── src/
│   ├── components/
│   │   ├── SessionModal.jsx       # Session timeout modal
│   │   └── OutletForm.jsx         # Main outlet form component
│   ├── hooks/
│   │   └── useOutletForm.js       # Custom form hook with validation
│   ├── utils/
│   │   └── constants.js           # Constants and enums
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # React entry point
├── package.json                    # Dependencies
├── vite.config.js                 # Vite configuration
└── edit-outlet-react.html         # HTML template
```

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Mode

```bash
npm run dev
```

This starts the Vite development server at `http://localhost:3000`

### 3. Production Build

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

## 📋 Component Overview

### SessionModal Component

**Purpose**: Manages user session timeout warnings

**Features**:
- Countdown timer display
- Extend session button
- Sign out button
- Automatic heartbeat to keep session alive

**Props**: None (self-contained)

**Usage**:
```jsx
import SessionModal from './components/SessionModal';

<SessionModal />
```

### OutletForm Component

**Purpose**: Main form for creating/editing outlets

**Features**:
- Dynamic field rendering based on outlet type
- Real-time validation
- File upload handling
- Conditional sections (POS, Management, Leasing, Ramadan Tent)

**Props**:
- `mode` (string): 'create' or 'edit'
- `initialData` (object): Initial form data for editing
- `onSubmit` (function): Callback when form is submitted
- `onCancel` (function): Callback when form is cancelled

**Usage**:
```jsx
import OutletForm from './components/OutletForm';

<OutletForm
  mode="create"
  initialData={null}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

### useOutletForm Hook

**Purpose**: Custom hook for form state management and validation

**Returns**:
- `formData`: Current form data
- `errors`: Validation errors
- `files`: Uploaded files
- `showLeasing`: Boolean for leasing section visibility
- `showRamadanFields`: Boolean for Ramadan tent fields
- `showRamadanAtts`: Boolean for Ramadan tent attachments
- `handleInputChange`: Function to handle input changes
- `handleFileChange`: Function to handle file uploads
- `validateForm`: Function to validate form
- `handleSubmit`: Function to submit form
- `resetForm`: Function to reset form

**Usage**:
```jsx
const {
  formData,
  errors,
  handleInputChange,
  validateForm,
  handleSubmit
} = useOutletForm(initialData);
```

## 🔧 Configuration

### Constants (src/utils/constants.js)

All outlet types, management types, and status codes are defined here:

```javascript
export const OUTLET_TYPES = {
  RESTAURANT_SPECIALTY: 449930000,
  LOUNGE: 449930001,
  MAIN_RESTAURANT: 449930002,
  CLUB_LOUNGE: 449930003,
  CAFE: 449930013,
  FINE_DINING: 449930016,
  RAMADAN_TENT: 449930017,
  SPA: 449930028
};
```

## 📝 Form Validation Rules

### Required Fields
- Outlet Name (English)
- Outlet Name (Arabic)
- Outlet Type
- Location
- Capacity (1-9999)
- Is Serving Hookah
- PMS ID
- Manager Name
- Manager CPR (9 digits)
- Manager Phone (8-15 characters)
- Manager Email (valid email format)

### Conditional Required Fields

**When Management Type is "Outsourced"**:
- Leasing Office CR
- Contract Start Date
- Contract End Date
- Leasing Contract Document (PDF)

**When Outlet Type is "Ramadan Tent"**:
- Location (Arabic)
- Location (English)
- Civil Defence Approval (PDF)
- Ministry of Health Approval (PDF)
- Posture Document (PDF)
- Ministry of Municipalities Approval (PDF)

**When POS Exists**:
- POS Name

### File Validation
- Maximum size: 10MB
- Allowed format: PDF only
- Automatic validation on file selection

## 🎨 Styling

The application uses:
- Bootstrap 5.3.0 for base styling
- Font Awesome 6.4.0 for icons
- Custom CSS for enhanced UX

### Key Style Features
- Smooth transitions on all interactive elements
- Visual feedback on form validation
- Responsive design for all screen sizes
- Accessible color contrast
- Modern card-based layout

## 🔄 Data Flow

### Creating a New Outlet

1. User clicks "Add New Outlet"
2. Modal opens with empty form
3. User fills in required fields
4. Real-time validation provides feedback
5. Conditional sections appear based on selections
6. User submits form
7. Data is validated
8. FormData is created with files
9. POST request to `/EditOutlet/doUpdate`
10. Success/error feedback to user

### Editing an Existing Outlet

1. User clicks edit button on outlet row
2. Modal opens with pre-filled data
3. User modifies fields
4. Real-time validation
5. User submits
6. Updated data sent to server
7. Table updates with new data

## 🧪 Integration with Backend

### Server Data Structure

The React app expects `window.outletData` to be populated:

```javascript
window.outletData = {
  outlets: [],              // Existing outlets
  outletTypes: [],          // Available outlet types
  managementTypes: [],      // Management type options
  offices: [],              // Leasing offices
  isBoutique: false,        // Hotel classification
  isExceptional: false,
  isApartmentHotel: false,
  stars: 0,                 // Hotel star rating
  rooms: 0,                 // Number of rooms
  processingOutlets: [],    // Outlets being processed
  inProcessOutlets: [],     // Outlets in process
  rInfo: {}                 // Ramadan info
};
```

### API Endpoints

**Keep Session Alive**:
```
POST /Main/KeepSessionAlive
```

**Submit Outlet Form**:
```
POST /EditOutlet/doUpdate
Content-Type: multipart/form-data
```

## 🚀 Improvements Over Original

### 1. **Modern React Patterns**
- Functional components with hooks
- Custom hooks for reusability
- Proper state management

### 2. **Better UX**
- Real-time validation
- Inline error messages
- Visual feedback
- Loading states
- Improved accessibility

### 3. **Code Organization**
- Separation of concerns
- Reusable components
- Centralized constants
- Clean file structure

### 4. **Performance**
- Optimized re-renders
- Efficient state updates
- Lazy loading potential

### 5. **Maintainability**
- Type-safe constants
- Clear prop interfaces
- Documented code
- Modular architecture

## 🔐 Security Considerations

- File type validation
- File size limits
- XSS protection through React
- CSRF token support (can be added)
- Input sanitization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

When contributing to this codebase:

1. Follow React best practices
2. Use functional components with hooks
3. Add prop validation
4. Write clear comments
5. Test all form states
6. Ensure accessibility

## 📄 License

BTEA Web Portal - Internal Use Only

---

## 🆘 Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify all required fields are filled
- Check file sizes and formats

### Session modal not appearing
- Verify session timeout settings
- Check browser console for API errors

### Styling issues
- Ensure Bootstrap CSS is loaded
- Check for CSS conflicts
- Verify Font Awesome is loaded

## 📞 Support

For issues or questions, contact the development team.
