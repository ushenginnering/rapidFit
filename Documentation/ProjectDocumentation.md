
# RapidFit Gym Management System

## Frontend Development & API Integration Documentation

**Project Name:** RapidFit Gym Management System (PWA)
**Version:** 1.0
**Prepared By:** Uchenna Martin Ukeh (Ush Engineering Technology)
**Date:** July 2026

---

# 1. Project Overview

RapidFit is a Progressive Web App (PWA) designed to help gyms manage:

* Member registration
* Membership subscriptions
* Check-ins
* Payments and renewals
* Corporate memberships
* Financial tracking
* Reports and analytics
* Staff management

The application should feel like a **premium fitness command center**, not a traditional admin panel.

---

# 2. Design Guidelines

## Design Style

* Minimalistic
* Glassmorphic
* Premium
* Futuristic
* Mobile-first

---

# 3. Branding

## Color Palette

| Usage          | Color             | Hex                    |
| -------------- | ----------------- | ---------------------- |
| Background     | Deep Black        | #080808                |
| Surface        | Dark Gray         | #141414                |
| Primary        | Rapid Red         | #E63946                |
| Text           | White             | #FFFFFF                |
| Secondary Text | Gray              | #A1A1AA                |
| Success        | Green             | #22C55E                |
| Warning        | Yellow            | #FACC15                |
| Danger         | Red               | #EF4444                |
| Borders        | Transparent White | rgba(255,255,255,0.08) |

---

# 4. Typography

### Headings

Bebas Neue

### Body

Inter

### Dashboard Numbers

Inter SemiBold

---

# 5. General UI Rules

## Border Radius

20px – 30px

## Card Style

```css
background: rgba(255,255,255,0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 24px;
```

## Animations

* Smooth transitions
* Soft shadows
* Hover effects
* No excessive animations

---

# 6. Project Structure

```text
src/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── logo/
│
├── css/
│   ├── style.css
│   ├── dashboard.css
│   └── auth.css
│
├── js/
│   ├── api.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── members.js
│   ├── checkin.js
│   ├── finance.js
│   └── utils.js
│
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── members.html
│   ├── member-details.html
│   ├── plans.html
│   ├── checkin.html
│   ├── finance.html
│   ├── reports.html
│   └── settings.html
```

---

# 7. Navigation

## Sidebar Menu

* Dashboard
* Members
* Check-In
* Membership Plans
* Finance
* Corporate Accounts
* Reports
* Staff
* Settings
* Logout

Desktop:

* Fixed Glass Sidebar

Mobile:

* Collapsible Sidebar
* Bottom Quick Actions

---

# 8. Authentication

## Login Page

Fields:

* Username/Email
* Password
* Remember Me

Features:

* Password visibility toggle
* Loading state
* Error handling

---

# 9. API Integration Standards

All API calls should use:

```javascript
fetch()
```

or

```javascript
axios
```

No page reloads.

Use asynchronous requests only.

---

# 10. API Base URL

```javascript
const API_BASE = "https://yourdomain.com/api/";
```

Place inside:

```javascript
js/api.js
```

---

# 11. Standard API Response Format

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
  "message": "Something went wrong"
}
```

---

# 12. API Helper

```javascript
async function api(url, method = "GET", data = null) {
    const options = {
        method,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(API_BASE + url, options);

    return await response.json();
}
```

---

# 13. Authentication Flow

Login:

```text
User Login
↓
API Request
↓
Receive Token
↓
Store Token
↓
Redirect Dashboard
```

Store:

```javascript
localStorage
```

or

```javascript
sessionStorage
```

depending on Remember Me.

---

# 14. Protected Pages

Every protected page should:

1. Check if token exists.
2. Redirect to login if not.

Example:

```javascript
if (!localStorage.getItem("token")) {
    location.href = "login.html";
}
```

---

# 15. Dashboard Page

Sections:

## KPI Cards

* Total Members
* Active Members
* Expiring Soon
* Revenue

## Revenue Chart

## Recent Check-Ins

## Expiring Memberships

## Quick Actions

---

# 16. Members Module

### List Members

### Search Members

### Add Member

### Edit Member

### View Profile

### Renew Membership

---

# 17. Check-In Module

Receptionist enters:

```text
FIT-1024
```

Response should show:

* Profile picture
* Name
* Membership
* Expiry date
* Status

Status colors:

Green → Active

Yellow → Expiring Soon

Red → Expired

---

# 18. Finance Module

Features:

* Income
* Expenses
* Profit
* Charts
* Reports

---

# 19. Loading States

Every API request should show:

* Button loading spinner
* Skeleton loaders
* Empty states

---

# 20. Error Handling

Display errors using toast notifications.

Never use:

```javascript
alert()
```

---

# 21. Responsive Breakpoints

Mobile:

```css
max-width: 768px
```

Tablet:

```css
769px - 1024px
```

Desktop:

```css
1025px+
```

---

# 22. Performance Requirements

* Lazy load images.
* Compress assets.
* Avoid unnecessary API calls.
* Debounce searches.
* Cache static data.

---

# 23. PWA Requirements

* Installable
* Service Worker
* Offline splash page
* App icons
* Manifest file

---

# 24. Development Principles

1. Keep components reusable.
2. Separate UI and API logic.
3. Write clean JavaScript.
4. Avoid inline CSS.
5. Avoid inline JavaScript.
6. Keep code modular.

---

# 25. Deliverables

The frontend developer should deliver:

* Fully responsive UI.
* Connected API endpoints.
* Loading states.
* Error handling.
* PWA support.
* Clean and maintainable code.
* Production-ready frontend.

---

# Final Vision

RapidFit should feel like:

> A premium, high-performance fitness command center designed for modern gyms.

Every page should communicate:

**Power. Performance. Premium Experience.**
