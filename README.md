# HealthEntries Application

A Node.js and Express-based application to help users track and manage their health entries, specifically for monitoring glucose levels. This project follows a structured rubric with requirements for backend functionality, user authentication, and security measures.

## Features

### Core Functionality
- **User Registration and Authentication**:
    - Registration and logon implemented using Passport for authentication.
    - Passwords are securely stored using hashing.
- **Health Entries Management**:
    - CRUD operations for health entries.
    - Secure access control ensures that users can only modify their own data.
    - Validation for all model attributes to prevent invalid records.
    - Support for additional data types like numbers, strings, dates, arrays, and booleans.
    - Time input field to track morning glucose levels along with the date.
- **Non-CRUD Features**:
    - Searching and filtering health entries.

### Additional Features
- **User Notifications**:
    - User-friendly messages for actions and errors, displayed in the UI.
- **Error Handling**:
    - Middleware to manage exceptions and provide clear messages to users.
- **Security**:
    - Uses security packages like `validator` for input sanitization, `express-rate-limit`, and `helmet`.
    - Access control middleware restricts create, update, and delete operations to authenticated users.

## Technologies Used
- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates (server-side rendering)
- **Authentication**: Passport-based authentication
- **Database**: MongoDB with Mongoose for modeling

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd healthEntries
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Usage
1. Navigate to `http://localhost:3000` in your browser.
2. Register and log in to access the application.
3. Use the provided routes to manage health entries securely.

## Deployment
- The application is deployed on Render.com with appropriate security configurations.

## Bonus Features
- Created the collection of Postman tests for API endpoints to ensure functionality, including `csrf` support.
- Applied pagination for efficient data navigation.
- Implemented light and dark theme modes for improved user experience.
- Enabled filtering over different data types, including strings, dates, times, and booleans.

## Future Enhancements
- Introduce charts and analytics for glucose level trends.
- Add test cases using Mocha, Chai, and Puppeteer.
- Implement PDF generation to present health data trends to third parties.
- Integrate a reminder system for users to log their health entries.
- Enable sharing of health entries with healthcare providers.
- Implement a feature to track medication and dosage.
- Add support for tracking other health metrics like blood pressure, weight, and exercise.
- Implement a feature to track food intake and its impact on glucose levels.
- Integrate a feature to track insulin dosage and its impact on glucose levels.
- Implement a feature to track exercise and its impact on glucose levels.
- Add a feature to track sleep patterns and their impact on glucose levels.
- Implement a feature to track stress levels and their impact on glucose levels.

---

Feel free to contribute to the project and submit your ideas for improvement!
