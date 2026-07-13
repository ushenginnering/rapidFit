# RapidFit Frontend JavaScript Architecture

## Folder Structure

```text
js/
│
├── app.js
├── api.js
├── auth.js
├── dashboard.js
├── members.js
├── plans.js
├── checkin.js
├── finance.js
├── corporate.js
├── reports.js
├── staff.js
├── settings.js
├── notifications.js
├── storage.js
├── ui.js
└── utils.js
```

---

# 1. app.js

## Responsibility

Application initialization and page bootstrapping.

## Functions

```javascript
initApp()
loadCurrentPage()
initializeComponents()
initializeSidebar()
initializeTheme()
initializeNotifications()
registerServiceWorker()
```

---

# 2. api.js

## Responsibility

Centralized API communication.

## Variables

```javascript
const API_BASE
```

## Functions

```javascript
apiRequest()
get()
post()
put()
patch()
deleteRequest()
uploadFile()
setAuthHeader()
handleApiError()
refreshToken()
```

Example:

```javascript
await post('members/create', data);
```

No page should call fetch() directly.

All requests must pass through api.js.

---

# 3. auth.js

## Responsibility

Authentication and session management.

## Functions

```javascript
login()
logout()
forgotPassword()
resetPassword()
changePassword()
saveToken()
getToken()
removeToken()
isAuthenticated()
redirectIfUnauthenticated()
redirectIfAuthenticated()
getCurrentUser()
```

---

# 4. dashboard.js

## Responsibility

Dashboard data and widgets.

## Functions

```javascript
loadDashboard()
loadStatistics()
loadRevenueChart()
loadRecentCheckins()
loadExpiringMembers()
loadQuickActions()
loadRecentPayments()
refreshDashboard()
```

---

# 5. members.js

## Responsibility

Member management.

## Functions

```javascript
loadMembers()
searchMembers()
filterMembers()
getMember()
createMember()
updateMember()
deleteMember()
renewMembership()
suspendMember()
activateMember()
uploadMemberPhoto()
loadMemberProfile()
loadMemberPaymentHistory()
loadMemberAttendance()
exportMembers()
```

---

# 6. plans.js

## Responsibility

Membership plans.

## Functions

```javascript
loadPlans()
getPlan()
createPlan()
updatePlan()
deletePlan()
assignPlan()
calculatePlanPrice()
loadPlanSubscribers()
```

---

# 7. checkin.js

## Responsibility

Gym entrance management.

## Functions

```javascript
initializeCheckin()
checkinMember()
getMemberStatus()
loadTodayCheckins()
loadCheckinHistory()
searchCheckinHistory()
manualCheckin()
manualCheckout()
playSuccessSound()
playExpiredSound()
showStatusCard()
```

---

# 8. finance.js

## Responsibility

Financial operations.

## Functions

```javascript
loadFinanceDashboard()
loadIncome()
loadExpenses()
addExpense()
editExpense()
deleteExpense()
loadProfitSummary()
loadRevenueChart()
loadExpenseChart()
loadCashFlow()
exportFinanceReport()
```

---

# 9. corporate.js

## Responsibility

Corporate organizations.

## Functions

```javascript
loadCompanies()
getCompany()
createCompany()
updateCompany()
deleteCompany()
loadCompanyMembers()
addCompanyMember()
removeCompanyMember()
renewCompanySubscription()
generateCompanyInvoice()
```

---

# 10. reports.js

## Responsibility

Analytics and reporting.

## Functions

```javascript
loadReports()
generateRevenueReport()
generateAttendanceReport()
generateMembershipReport()
generateCorporateReport()
generateExpenseReport()
exportPdf()
exportExcel()
printReport()
```

---

# 11. staff.js

## Responsibility

Staff management.

## Functions

```javascript
loadStaff()
getStaff()
createStaff()
updateStaff()
deleteStaff()
changeStaffRole()
activateStaff()
deactivateStaff()
resetStaffPassword()
```

---

# 12. settings.js

## Responsibility

Application settings.

## Functions

```javascript
loadSettings()
saveGeneralSettings()
saveGymInformation()
savePaymentSettings()
saveNotificationSettings()
saveBrandingSettings()
uploadLogo()
uploadBackground()
changeTheme()
```

---

# 13. notifications.js

## Responsibility

Notifications.

## Functions

```javascript
loadNotifications()
markAsRead()
markAllAsRead()
sendNotification()
sendSMS()
sendEmail()
showToast()
showSuccess()
showError()
showWarning()
showInfo()
```

---

# 14. storage.js

## Responsibility

Local storage abstraction.

## Functions

```javascript
save()
get()
remove()
clear()
saveToken()
getToken()
saveUser()
getUser()
```

No direct localStorage calls outside this file.

---

# 15. ui.js

## Responsibility

Reusable UI components.

## Functions

```javascript
showLoader()
hideLoader()
showModal()
hideModal()
showConfirmDialog()
showEmptyState()
showSkeleton()
renderPagination()
renderTable()
renderCard()
toggleSidebar()
togglePassword()
toggleDropdown()
toggleAccordion()
```

---

# 16. utils.js

## Responsibility

General helper functions.

## Functions

```javascript
formatCurrency()
formatDate()
formatDateTime()
capitalize()
debounce()
throttle()
generateId()
copyToClipboard()
downloadFile()
printElement()
getQueryParam()
serializeForm()
validateEmail()
validatePhone()
```

---

# Event Naming Convention

```javascript
handleLoginSubmit()
handleMemberSearch()
handleCreateMember()
handleRenewMembership()
handleCheckin()
```

---

# API Integration Pattern

Example:

```javascript
async function loadMembers() {
    try {
        ui.showLoader();

        const response = await api.get('members');

        renderMembers(response.data);

    } catch (error) {
        notifications.showError(error.message);
    } finally {
        ui.hideLoader();
    }
}
```

---

# Rule

Each file should only manage its own responsibility.

❌ finance.js should not contain member functions.

❌ members.js should not call fetch directly.

❌ dashboard.js should not manipulate localStorage.

This separation is mandatory for maintainability.

---

# Initialization Flow

```text
Page Loads
↓
app.js
↓
auth.js
↓
page specific JS
↓
api.js
↓
render UI
```

---

# Coding Standard

* Use async/await.
* Use ES6 modules.
* Use camelCase.
* One responsibility per function.
* Keep functions under 50 lines whenever possible.
* All API calls go through api.js.
* All notifications go through notifications.js.
* All loaders and modals go through ui.js.
