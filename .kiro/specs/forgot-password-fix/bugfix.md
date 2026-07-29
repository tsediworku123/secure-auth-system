# Bugfix Requirements Document

## Introduction

The forgot password functionality is currently broken due to two critical issues: (1) the email service module (emailService.js) is incomplete, missing the nodemailer import and the sendPasswordResetEmail function that is being called by the auth controller, and (2) the ResetPassword.jsx component has a duplicate handleSubmit function definition causing a syntax error that prevents the password reset form from submitting properly. This prevents users from successfully completing the password reset flow.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the forgotPassword controller attempts to call sendPasswordResetEmail THEN the system throws an error because the function is not defined in emailService.js

1.2 WHEN the emailService.js module is loaded THEN the system crashes because nodemailer is referenced but never imported

1.3 WHEN a user submits the reset password form in ResetPassword.jsx THEN the form does not submit properly because there are two handleSubmit function definitions causing a syntax error

1.4 WHEN the user enters their email on the forgot password page and submits THEN the system fails to send a password reset email due to the missing sendPasswordResetEmail implementation

### Expected Behavior (Correct)

2.1 WHEN the forgotPassword controller calls sendPasswordResetEmail THEN the system SHALL successfully invoke the function with the user's email and reset token

2.2 WHEN the emailService.js module is loaded THEN the system SHALL have nodemailer properly imported and available for creating the email transporter

2.3 WHEN a user submits the reset password form in ResetPassword.jsx THEN the system SHALL call a single, correctly defined handleSubmit function that sends the token and new password to the backend

2.4 WHEN the user enters their email on the forgot password page and submits THEN the system SHALL send a password reset email containing a link with the reset token to the user's email address

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user submits a valid reset token and new password THEN the system SHALL CONTINUE TO validate the token, check expiration, validate password strength, hash the password, and update the database

3.2 WHEN a user enters an email that doesn't exist in the system THEN the system SHALL CONTINUE TO return a generic success message without revealing whether the email exists

3.3 WHEN the forgot password endpoint generates a reset token THEN the system SHALL CONTINUE TO store it in the database with a 15-minute expiration time

3.4 WHEN the reset password endpoint receives a request THEN the system SHALL CONTINUE TO validate that the token exists and has not expired before allowing the password change

3.5 WHEN a user successfully resets their password THEN the system SHALL CONTINUE TO clear the reset_token and reset_token_expires fields from the database
