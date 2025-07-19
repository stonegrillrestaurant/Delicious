<?php
// Sanitize & validate input
$name    = strip_tags(trim($_POST["name"]));
$email   = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
$subject = strip_tags(trim($_POST["subject"]));
$message = trim($_POST["message"]);

// Where to send the email
$to = "stonegrill2014@gmail.com";

// Validate fields
if (empty($name) || empty($message) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo "Please complete all required fields correctly.";
  exit;
}

// Build email body
$email_content = "Name: $name\n";
$email_content .= "Email: $email\n";
$email_content .= "Subject: $subject\n\n";
$email_content .= "Message:\n$message\n";

$headers = "From: $name <$email>";

// Send the email
if (mail($to, $subject, $email_content, $headers)) {
  http_response_code(200);
  echo "Your message has been sent. Thank you!";
} else {
  http_response_code(500);
  echo "Sorry, there was a problem sending your message.";
}
?>
