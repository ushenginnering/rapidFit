# RapidFit Gym Management System

# Backend API & Functional Specification

## Base URL

```text
https://yourdomain.com/api/v1/
```

All endpoints return:

## Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

## Error

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# Authentication Module

## Login

### Endpoint

```text
POST /auth/login
```

### Payload

```json
{
  "email": "admin@gym.com",
  "password": "password"
}
```

### Returns

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {}
}
```

---

## Logout

```text
POST /auth/logout
```

---

## Forgot Password

```text
POST /auth/forgot-password
```

---

## Reset Password

```text
POST /auth/reset-password
```

---

## Get Logged In User

```text
GET /auth/me
```

---

# Dashboard Module

## Get Dashboard Statistics

```text
GET /dashboard
```

Returns:

```json
{
  "total_members": 1254,
  "active_members": 965,
  "expiring_members": 34,
  "expired_members": 18,
  "monthly_revenue": 3200000
}
```

---

## Revenue Chart

```text
GET /dashboard/revenue-chart
```

---

## Recent Checkins

```text
GET /dashboard/recent-checkins
```

---

## Expiring Members

```text
GET /dashboard/expiring-members
```

---

# Members Module

## List Members

```text
GET /members
```

Query Parameters:

```text
?page=1
&search=
&status=
&plan=
```

---

## Get Member

```text
GET /members/{id}
```

---

## Create Member

```text
POST /members
```

Payload:

```json
{
  "first_name": "",
  "last_name": "",
  "phone": "",
  "email": "",
  "address": "",
  "gender": "",
  "dob": ""
}
```

---

## Update Member

```text
PUT /members/{id}
```

---

## Delete Member

```text
DELETE /members/{id}
```

---

## Upload Member Photo

```text
POST /members/{id}/photo
```

---

## Suspend Member

```text
POST /members/{id}/suspend
```

---

## Activate Member

```text
POST /members/{id}/activate
```

---

## Member Attendance History

```text
GET /members/{id}/attendance
```

---

## Member Payment History

```text
GET /members/{id}/payments
```

---

# Membership Plans Module

## List Plans

```text
GET /plans
```

---

## Create Plan

```text
POST /plans
```

Payload:

```json
{
  "name": "Monthly",
  "price": 20000,
  "duration": 30
}
```

---

## Update Plan

```text
PUT /plans/{id}
```

---

## Delete Plan

```text
DELETE /plans/{id}
```

---

## Assign Plan To Member

```text
POST /plans/assign
```

Payload:

```json
{
  "member_id": 1,
  "plan_id": 3
}
```

---

## Renew Membership

```text
POST /plans/renew
```

Payload:

```json
{
  "member_id": 1,
  "plan_id": 3
}
```

---

# Check-In Module

## Check Member Status

```text
POST /checkin/status
```

Payload:

```json
{
  "member_code": "FIT-1024"
}
```

Returns:

```json
{
  "status": "active",
  "member": {}
}
```

Status:

* active
* expiring
* expired

---

## Check In Member

```text
POST /checkin
```

Payload:

```json
{
  "member_id": 1
}
```

---

## Check Out Member

```text
POST /checkout
```

---

## Today's Checkins

```text
GET /checkin/today
```

---

## Checkin History

```text
GET /checkin/history
```

---

# Corporate Accounts Module

## List Companies

```text
GET /companies
```

---

## Get Company

```text
GET /companies/{id}
```

---

## Create Company

```text
POST /companies
```

---

## Update Company

```text
PUT /companies/{id}
```

---

## Delete Company

```text
DELETE /companies/{id}
```

---

## Add Employee To Company

```text
POST /companies/{id}/members
```

---

## Remove Employee

```text
DELETE /companies/{id}/members/{member_id}
```

---

## Renew Company Subscription

```text
POST /companies/{id}/renew
```

---

# Finance Module

## Dashboard Summary

```text
GET /finance/dashboard
```

---

## Income History

```text
GET /finance/income
```

---

## Expenses

```text
GET /expenses
```

---

## Add Expense

```text
POST /expenses
```

---

## Update Expense

```text
PUT /expenses/{id}
```

---

## Delete Expense

```text
DELETE /expenses/{id}
```

---

## Profit Report

```text
GET /finance/profit
```

---

## Revenue Chart

```text
GET /finance/revenue-chart
```

---

## Expense Chart

```text
GET /finance/expense-chart
```

---

# Reports Module

## Membership Report

```text
GET /reports/members
```

---

## Revenue Report

```text
GET /reports/revenue
```

---

## Attendance Report

```text
GET /reports/attendance
```

---

## Corporate Report

```text
GET /reports/companies
```

---

## Export PDF

```text
GET /reports/pdf
```

---

## Export Excel

```text
GET /reports/excel
```

---

# Staff Module

## List Staff

```text
GET /staff
```

---

## Create Staff

```text
POST /staff
```

---

## Update Staff

```text
PUT /staff/{id}
```

---

## Delete Staff

```text
DELETE /staff/{id}
```

---

## Reset Password

```text
POST /staff/{id}/reset-password
```

---

# Notification Module

## Notifications

```text
GET /notifications
```

---

## Mark Read

```text
POST /notifications/{id}/read
```

---

## Send SMS

```text
POST /notifications/sms
```

---

## Send Email

```text
POST /notifications/email
```

---

# Settings Module

## Gym Information

```text
GET /settings
```

---

## Save Settings

```text
POST /settings
```

---

## Upload Logo

```text
POST /settings/logo
```

---

## Upload Login Background

```text
POST /settings/background
```

---

# PWA Module

## Get App Configuration

```text
GET /app/config
```

Returns:

* app_name
* logo
* theme_color
* contact_information
* payment_configuration

---

# Functional Requirements Summary

### Authentication

* Login
* Logout
* Password reset

### Dashboard

* Statistics
* Revenue charts
* Quick actions

### Members

* CRUD
* Attendance
* Payments
* Status tracking

### Plans

* Create plans
* Renew plans
* Assign plans

### Check-In

* Real-time status
* Attendance logs

### Corporate

* Company accounts
* Employee management

### Finance

* Revenue
* Expenses
* Profit

### Reports

* Exportable reports

### Staff

* Role management

### Notifications

* SMS
* Email
* In-app notifications

### Settings

* Branding
* Payment gateways
* Gym information
