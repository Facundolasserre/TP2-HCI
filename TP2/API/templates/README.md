# Email Templates

This directory contains email templates used by the Grocery Manager API. Templates use the `.mft` (Mail Format Template) extension.

## Available Templates

### 1. `registration.mft`
Used when a new user registers.

**Available Variables:**
- `<%FIRST_NAME%>` - User's first name
- `<%VERIFICATION_CODE%>` - Verification code for account activation

**Environment Variable for Subject:**
```
REGISTRATION_SUBJECT="Email verification"
```

---

### 2. `reset-password.mft`
Used when a user requests a password reset.

**Available Variables:**
- `<%VERIFICATION_CODE%>` - Password reset code
- `<%EXPIRATION_DATE%>` - Date and time when the code expires

**Environment Variable for Subject:**
```
RESET_PASSWORD_SUBJECT="Reset Password Verification"
```

---

### 3. `pantry-shared.mft`
Used when a pantry is shared with another user.

**Available Variables:**
- `<%RECIPIENT_NAME%>` - Name of the user receiving the pantry
- `<%PANTRY_NAME%>` - Name of the shared pantry
- `<%OWNER_NAME%>` - Name of the user sharing the pantry

**Environment Variable for Subject:**
```
PANTRY_SHARED_SUBJECT="Pantry Shared with You"
```

---

### 4. `list-shared.mft`
Used when a shopping list is shared with another user.

**Available Variables:**
- `<%RECIPIENT_NAME%>` - Name of the user receiving the list
- `<%LIST_NAME%>` - Name of the shared shopping list
- `<%OWNER_NAME%>` - Name of the user sharing the list

**Environment Variable for Subject:**
```
LIST_SHARED_SUBJECT="Shopping List Shared with You"
```

---

## How It Works

1. **Template Loading**: The API attempts to read the template file from this directory
2. **Fallback**: If the file doesn't exist or can't be read, a default hardcoded template is used
3. **Variable Replacement**: All occurrences of variables (e.g., `<%FIRST_NAME%>`) are replaced with actual values
4. **Subject Customization**: Email subjects can be customized via environment variables

## Customizing Templates

To customize an email template:

1. Edit the corresponding `.mft` file in this directory
2. Use the available variables for that template type
3. Save the file
4. Restart the API server for changes to take effect

## Customizing Email Subjects

Add the following environment variables to your `.env` file:

```bash
# Email Subjects (optional)
REGISTRATION_SUBJECT="Welcome to Grocery Manager!"
RESET_PASSWORD_SUBJECT="Reset Your Password"
PANTRY_SHARED_SUBJECT="Someone shared a pantry with you"
LIST_SHARED_SUBJECT="Someone shared a shopping list with you"
```

If not specified, default subjects will be used.

## Template Syntax

- Variables must be enclosed in `<%` and `%>`
- Variable names are case-sensitive
- Variables can appear multiple times in a template
- HTML is fully supported

## Example

```html
<div style="text-align: center;">
    <h1>Hello <%FIRST_NAME%>!</h1>
    <p>Your verification code is: <strong><%VERIFICATION_CODE%></strong></p>
    <p>Welcome to Grocery Manager, <%FIRST_NAME%>!</p>
</div>
```

In this example, `<%FIRST_NAME%>` appears twice and will be replaced in both locations.
