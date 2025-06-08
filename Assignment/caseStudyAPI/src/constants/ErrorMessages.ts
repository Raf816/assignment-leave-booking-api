export const ErrorMessages = {

  //usercontroller errors
  NO_USER_ID_PROVIDED: "No ID provided",
  INVALID_USER_ID_FORMAT: "Invalid ID format",
  USER_NOT_FOUND: "User not found",
  USER_NOT_FOUND_WITH_ID: (id: number) => `User not found with ID: ${id}`,
  PASSWORD_IS_BLANK: "Password is blank",
  FAILED_TO_RETRIEVE_USERS: "Failed to retrieve users",
  FAILED_TO_RETRIEVE_USER: "Failed to retrieve user",
  USER_NOT_FOUND_FOR_DELETION: "User with the provided ID not found",
  EMAIL_REQUIRED: "Email is required",
  EMAIL_NOT_FOUND: (email: string) => `${email} not found`,
  RETRIEVING_USER_FAILED: (error: string) => `Error retrieving user: ${error}`,
  UNABLE_TO_FIND_USER_EMAIL: (email: string) => `Unable to find user with the email: ${email}`,
  VALIDATION_FAILED: "Validation failed",

  //User Management
  STAFF_OR_MANAGER_ID_REQUIRED: "Both staffId and managerId are required",
  STAFF_OR_MANAGER_NOT_FOUND: "Staff or manager user not found",
  ASSIGNMENT_ALREADY_EXISTS: "This staff is already assigned to the given manager",
  ASSIGNMENT_FAILED: "Failed to assign manager",
  ASSIGNMENT_SUCCESS: "Manager assigned to staff successfully",

  //LeaveRequest
  UNAUTHORISED_USER: "User not authorised",
  INVALID_DATE_RANGE: (start: string, end: string) => `End date of ${end} is before the start date of ${start}`,
  OVERLAPPING_LEAVE: "Leave dates overlap with an existing request",
  LEAVE_EXCEEDS_BALANCE: "Days requested exceed remaining balance",
  INVALID_LEAVE_ID: "Invalid leave request ID",
  LEAVE_REQUEST_NOT_FOUND: "Leave request not found",
  CANNOT_APPROVE_NON_PENDING: (status: string) => `Cannot approve request with status: ${status}`,
  INSUFFICIENT_BALANCE: "Insufficient leave balance to approve",
  CANNOT_REJECT_NON_PENDING: (status: string) => `Cannot reject leave request with status: ${status}`,
  CANNOT_CANCEL_STATUS: (status: string) => `Cannot cancel request with status: ${status}`,
  UNAUTHORISED_CANCEL: "Not authorised to cancel this request",
  FAILED_TO_APPROVE: "Failed to approve leave request",
  FAILED_TO_REJECT: "Failed to reject the leave request",
  FAILED_TO_CANCEL: "Failed to cancel leave request",
  FAILED_TO_RETRIEVE_LEAVE: "Failed to retrieve leave requests",
  NO_PENDING_FOR_MANAGER: "No pending requests for your staff",
  NOT_AUTHORIZED_TO_VIEW: "Not authorized to view pending requests",
  NO_LEAVE_REQUESTS_FOUND: (name: string) => `No leave requests found for ${name}`,
  FAILED_TO_GET_REMAINING: "Failed to get remaining leave",
  FAILED_TO_UPDATE_BALANCE: "Failed to update leave balance",
  BALANCE_MUST_BE_NUMBER: "Annual leave balance must be a valid number",
  BALANCE_CANNOT_BE_NEGATIVE: "Annual leave balance cannot be negative",
  BALANCE_UPDATED: "Leave balance successfully updated",

  //login
  NO_EMAIL_PROVIDED: "No email provided",
  NO_PASSWORD_PROVIDED: "No password provided",
  PASSWORD_INCORRECT: "Password incorrect",


  INTERNAL_ERROR: "An error occurred while processing the request",


};
