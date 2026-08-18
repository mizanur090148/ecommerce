<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactApiController extends Controller
{
    /**
     * Store contact inquiry in database & send notification emails.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $subjectText = !empty($validated['subject']) ? $validated['subject'] : 'New Customer Inquiry';
        $phoneText = !empty($validated['phone']) ? $validated['phone'] : 'N/A';

        $fullMessage = $validated['message'];
        if (!empty($validated['subject'])) {
            $fullMessage = "[Subject: {$validated['subject']}] " . $fullMessage;
        }
        if (!empty($validated['phone'])) {
            $fullMessage .= " (Phone: {$validated['phone']})";
        }

        // 1. Store in Database Table
        $inquiry = ContactInquiry::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $fullMessage,
            'status' => 'unread',
        ]);

        // 2. Send Email Notification to Admin & Customer
        try {
            $adminEmail = config('mail.from.address', 'sale@gentlestyle.com');
            $adminName = config('mail.from.name', 'E-Commerce Store');

            // Admin Email Notification Body
            $adminEmailBody = "New Inquiry Received!\n\n" .
                "Name: {$validated['name']}\n" .
                "Email: {$validated['email']}\n" .
                "Phone: {$phoneText}\n" .
                "Subject: {$subjectText}\n\n" .
                "Message:\n{$validated['message']}\n\n" .
                "Inquiry ID: #{$inquiry->id}\n" .
                "Date: " . now()->format('Y-m-d H:i:s');

            Mail::raw($adminEmailBody, function ($mail) use ($adminEmail, $subjectText, $validated) {
                $mail->to($adminEmail)
                    ->subject("📩 New Contact Form Inquiry: {$subjectText}")
                    ->replyTo($validated['email'], $validated['name']);
            });

            // Customer Confirmation Email Body
            $customerEmailBody = "Dear {$validated['name']},\n\n" .
                "Thank you for contacting {$adminName}! We have received your message regarding \"{$subjectText}\".\n\n" .
                "Our customer support team will review your inquiry and get back to you shortly.\n\n" .
                "Best regards,\n" .
                "Customer Support Team\n{$adminName}";

            Mail::raw($customerEmailBody, function ($mail) use ($validated, $adminName) {
                $mail->to($validated['email'], $validated['name'])
                    ->subject("We received your message - {$adminName}");
            });

        } catch (\Throwable $e) {
            // Log mail dispatch exception so inquiry storage is never affected
            Log::warning('Contact form mail sending failed: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Thank you for reaching out! Your message has been stored and email sent.',
            'data' => $inquiry,
        ]);
    }
}
