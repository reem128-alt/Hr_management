# HR Management System

A comprehensive HR Management System built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, HR, Manager, Employee)
- **Employee Management**: Complete CRUD operations for employee records
- **Department Management**: Manage departments and assign employees
- **Position Management**: Define and manage job positions
- **Attendance Tracking**: Track employee check-in/check-out and working hours
- **Leave Management**: Request, approve, and manage employee leaves
- **Payroll Management**: Generate and manage payrolls with items (allowances, deductions, overtime)
- **Notifications**: In-app notification system for important updates

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HR-managment
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/hr_management?schema=public"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3000
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile (protected)

### Employees
- `GET /employees` - Get all employees
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create new employee (Admin/HR only)
- `PATCH /employees/:id` - Update employee (Admin/HR only)
- `DELETE /employees/:id` - Delete employee (Admin/HR only)

### Departments
- `GET /departments` - Get all departments
- `GET /departments/:id` - Get department by ID
- `POST /departments` - Create department (Admin/HR only)
- `PATCH /departments/:id` - Update department (Admin/HR only)
- `DELETE /departments/:id` - Delete department (Admin/HR only)

### Positions
- `GET /positions` - Get all positions
- `GET /positions/:id` - Get position by ID
- `POST /positions` - Create position (Admin/HR only)
- `PATCH /positions/:id` - Update position (Admin/HR only)
- `DELETE /positions/:id` - Delete position (Admin/HR only)

### Attendance
- `GET /attendance` - Get all attendance records (with optional filters: employeeId, startDate, endDate)
- `GET /attendance/:id` - Get attendance by ID
- `POST /attendance` - Create attendance record (Admin/HR/Manager only)
- `POST /attendance/check-in/:employeeId` - Check in employee
- `POST /attendance/check-out/:employeeId` - Check out employee
- `PATCH /attendance/:id` - Update attendance (Admin/HR/Manager only)
- `DELETE /attendance/:id` - Delete attendance (Admin/HR only)

### Leaves
- `GET /leaves` - Get all leaves (with optional filters: employeeId, status)
- `GET /leaves/:id` - Get leave by ID
- `POST /leaves` - Create leave request
- `PATCH /leaves/:id` - Update leave request (only pending leaves)
- `PATCH /leaves/:id/approve` - Approve/reject leave (Admin/HR/Manager only)
- `DELETE /leaves/:id` - Delete leave (only pending leaves)

### Payrolls
- `GET /payrolls` - Get all payrolls (with optional filters: employeeId, startDate, endDate)
- `GET /payrolls/:id` - Get payroll by ID
- `POST /payrolls` - Create payroll (Admin/HR only)
- `PATCH /payrolls/:id` - Update payroll (Admin/HR only)
- `DELETE /payrolls/:id` - Delete payroll (Admin/HR only)

### Notifications
- `GET /notifications` - Get all notifications for current user
- `GET /notifications/count` - Get unread notification count
- `GET /notifications/:id` - Get notification by ID
- `POST /notifications` - Create notification (Admin/HR/Manager only)
- `PATCH /notifications/:id/read` - Mark notification as read
- `PATCH /notifications/read-all` - Mark all notifications as read
- `DELETE /notifications/:id` - Delete notification

## Database Schema

The application uses Prisma ORM with PostgreSQL. The schema includes:

- **User**: Authentication and user accounts
- **Employee**: Employee information and details
- **Department**: Organizational departments
- **Position**: Job positions
- **Attendance**: Employee attendance records
- **Leave**: Leave requests and approvals
- **Payroll**: Payroll records
- **PayrollItem**: Payroll line items (allowances, deductions, overtime)
- **File**: Employee files and documents

## Roles

- **ADMIN**: Full system access
- **HR**: Human resources management
- **MANAGER**: Department/team management
- **EMPLOYEE**: Basic employee access

## Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## License

ISC

