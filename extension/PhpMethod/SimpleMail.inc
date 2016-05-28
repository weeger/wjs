<?php

namespace Wjs5\PhpMethod;

function simpleMail($from, $to, $subject, $message) {
  mail($to, $subject, $message, 'From: ' . $from . "\r\n" .
    'Reply-To: noreply@wexample.com' . "\r\n" .
    'X-Mailer: PHP/' . phpversion());
}
