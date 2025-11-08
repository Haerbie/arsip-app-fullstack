# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a brand-new visitor arrives, they land on the application’s public entry point, which can be the dedicated landing page or the direct sign-in link. From here, they are presented with options to either sign in or sign up. For signing up, the user enters their name, email, and password into the registration form and submits. Upon submission, their account is created with a default status of “pending.” A background process notifies a superadmin that a new user awaits approval. While social login methods could be added later, the current flow uses only email and password. After registration, the user sees a confirmation screen explaining that their account is pending approval. Once the superadmin approves, the user receives an email notification and can then sign in. To sign in, the user supplies their email and password on the sign-in form. If the credentials match and the user is approved, they are redirected to the main dashboard. To sign out, the user clicks the profile icon in the header and selects the logout action, which securely clears their session and takes them back to the sign-in page. For users who forget their password, there is a “Forgot Password” link beneath the sign-in form. Clicking it asks for the registered email, sends a recovery link, and guides the user through a password reset page to choose a new password. After resetting the password successfully, the user returns to the sign-in screen to log in with the new credentials.

## Main Dashboard or Home Page

Once the user logs in, they land on the dashboard at `/dashboard`. At the top, a fixed header displays the application name, the logged-in user’s name and role, and the theme toggle for switching between light and dark mode. On the left side, a collapsible sidebar lists all the main sections: Archive Statistics, Berkas Arsip, Arsip Unit, Kategori, Sub Kategori, Kode Klasifikasi, Unit Pengolah, and, for superadmins, Manajemen Pengguna. In the center of the screen, a set of interactive widgets and charts show real-time metrics such as the total count of archive bundles, recent activity logs, and pending user approvals. The user can expand or collapse the sidebar by clicking the menu icon in the header. Navigating to any of the listed sections simply involves clicking the corresponding link; the content area then transitions to that management page without a full page reload.

## Detailed Feature Flows and Page Transitions

### Archive Statistics Dashboard

The Archive Statistics page is the default view under the Dashboard link. Here, the app fetches live data from the MySQL database via API routes and displays charts for total archives, units processed per month, and user activity. Hovering over any chart segment shows tooltips with exact numbers. Clicking on a chart segment, such as a month in the activity chart, navigates the user to the related module page—often the Berkas Arsip listing filtered by that month.

### Managing Berkas Arsip

When the user clicks on “Berkas Arsip” in the sidebar, the app displays a paginated table of archive bundles, including columns for title, creation date, status, and operator. At the top of the list, a filter bar allows the user to search by title or filter by status. Clicking the “Add New Bundle” button opens a modal form that collects the bundle name and description. Upon submitting, the app calls an API route protected by role checks and then redirects the user to the newly created bundle’s detail page. On the detail page, the top section shows bundle information and an action bar with buttons for editing or deleting. Below, a nested table lists associated Arsip Units. A button labeled “Add Unit” triggers a slide-in panel containing a form with dropdowns for selecting Kode Klasifikasi and Unit Pengolah. The user selects the appropriate options and hits “Save.” After successful submission, the new unit appears in the table immediately.

### Managing Arsip Unit

Under the sidebar link “Arsip Unit,” the user sees a standalone table of all units. Similar filter and search controls sit above the table. Each row has action icons for view, edit, and delete. Clicking “view” opens a drawer that displays detailed unit information, including linked classification code and processing unit. Editing brings up an inline form to change fields. All changes call API routes guarded by role-based access checks and then update the table in real time.

### Managing Kategori and Sub Kategori

Navigating to “Kategori” presents a list of main categories. Above the list, the user finds an “Add Category” button that opens a form with fields for name and description. Saving creates a new category and refreshes the table. If the user clicks on a category, they move to the Sub Kategori page filtered for that category. There, they can add, view, and edit subcategories in the same pattern, always returning to the parent category’s detail view or the main Sub Kategori listing as needed.

### Managing Kode Klasifikasi and Unit Pengolah

In “Kode Klasifikasi,” the interface resembles other tables with columns for code, title, and description. Adding or editing invokes a form modal. Deleting shows a confirmation alert. Similarly, “Unit Pengolah” allows CRUD operations in its own table. Both modules use shared form and table components from the UI library, ensuring a consistent look and feel.

### Managing Manajemen Pengguna

Only users with the superadmin role see the “Manajemen Pengguna” link. Clicking it shows a table of all registered users with their email, role, status, and date joined. New registrations appear with a “pending” status. Each row has action buttons for Approve, Change Role, and Disable. Approving a pending user updates their status via a protected API route and sends them a notification email. Changing a role opens a small form where the superadmin can switch between operator and standard user. Disabling shows a confirmation before revoking access. After any action, the table refreshes to reflect current statuses.

## Settings and Account Management

Accessible via the profile icon in the header, the Account Settings page lets users update personal information such as name and email. Users can also change their password by entering the current password and choosing a new one. A separate section on this page offers notification preferences, where users toggle email alerts for new approvals or system updates. A theme toggle switch is present here as well, providing another way to switch between light and dark mode. When users save any changes, the app calls the corresponding API route to update their profile and then displays a success toast. A link at the bottom allows the user to return to the main dashboard.

## Error States and Alternate Paths

If users enter an email or password that does not match any account, the sign-in form displays a clear error message stating “Invalid email or password.” When attempting to access a protected page without signing in, the user is redirected to the sign-in page with a message explaining the need to log in. If the user’s status is still pending, any attempt to sign in triggers an alert indicating that approval is required. During form submissions, if the network goes down, the app shows a notification banner at the top explaining that the request failed, and the user can retry the action. For API errors such as insufficient permissions, the app displays a modal with an “Access Denied” message and instructions to contact the superadmin. Navigating to a non-existent route renders a friendly 404 page guiding users back to the dashboard or the sign-in page.

## Conclusion and Overall App Journey

A user’s journey begins with discovering the app’s landing page, registering, and waiting for superadmin approval. Once approved, they sign in and arrive at a dashboard rich with archive statistics. From there, they navigate seamlessly through the collapsible sidebar to manage archive bundles, units, categories, classification codes, and processing units. Superadmins gain an additional user management view to approve and control user roles. Users can adjust their profile and notification preferences at any time, and the app gracefully handles errors, lost passwords, and access restrictions. Throughout daily usage, the user moves fluidly between pages, performing CRUD operations with consistent interface patterns, and relies on real-time data feedback to keep the archive system organized and up to date.