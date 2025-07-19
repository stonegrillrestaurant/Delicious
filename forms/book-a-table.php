<?php
// Sanitize and validate input
$name    = strip_tags(trim($_POST["name"]));
$email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
$phone   = strip_tags(trim($_POST["phone"]));
$date    = strip_tags(trim($_POST["date"]));
$time    = strip_tags(trim($_POST["time"]));
$people  = strip_tags(trim($_POST["people"]));
$message = trim($_POST["message"]);

$to = "stonegrill2014@gmail.com"; // ✅ Your real email address
$subject = "New Table Booking Request from Website";

// Validate essential fields
if (empty($name) || !filter_var($email, FILTER_VALIDATE_EMAIL) || empty($phone) || empty($date) || empty($time)) {
  http_response_code(400);
  echo "Please complete all required fields.";
  exit;
}

// Build the email body
$email_content = "Name: $name\n";
$email_content .= "Email: $email\n";
$email_content .= "Phone: $phone\n";
$email_content .= "Date: $date\n";
$email_content .= "Time: $time\n";
$email_content .= "People: $people\n";
$email_content .= "Message:\n$message\n";

$headers = "From: $name <$email>";

// Send the email
if (mail($to, $subject, $email_content, $headers)) {
  http_response_code(200);
  echo "Your booking request has been sent. We'll get back to you shortly!";
} else {
  http_response_code(500);
  echo "Oops! Something went wrong. Please try again later.";
}
?>
