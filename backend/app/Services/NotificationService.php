<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send automated SMS & Email notification on order status change.
     */
    public function sendOrderStatusNotification(Order $order, string $newStatus): void
    {
        try {
            // 1. Send SMS Notification (SSL Wireless / BulkSMS BD / Twilio / Custom API)
            $this->sendSmsNotification($order, $newStatus);

            // 2. Send Email Notification
            $this->sendEmailNotification($order, $newStatus);
        } catch (\Throwable $e) {
            Log::error("Failed to send order status notification for Order #{$order->order_number}: " . $e->getMessage());
        }
    }

    /**
     * Send SMS to customer mobile phone.
     */

    public function sendSmsNotification(Order $order, string $status): void
    {
        $phone = $order->customer_phone;
        if (empty($phone)) {
            return;
        }

        $message = $this->buildSmsMessage($order, $status);

        // Check if SMS API Gateway configuration exists in .env
        $smsApiUrl = config('services.sms.url', env('SMS_API_URL'));
        $smsApiKey = config('services.sms.api_key', env('SMS_API_KEY'));
        $smsSenderId = config('services.sms.sender_id', env('SMS_SENDER_ID', 'AdminPanel'));

        if ($smsApiUrl && $smsApiKey) {
            // Generic HTTP Post to Gateway API (SSL Wireless / BulkSMS / Greenweb BD)
            Http::post($smsApiUrl, [
                'api_key' => $smsApiKey,
                'sender_id' => $smsSenderId,
                'to' => $phone,
                'message' => $message,
            ]);
            Log::info("SMS Notification dispatched to {$phone} for Order #{$order->order_number}: Status -> {$status}");
        } else {
            // Log SMS payload for development/testing audit
            Log::info("[DEV SMS MOCK] To: {$phone} | Msg: {$message}");
        }
    }

    /**
     * Send Email to customer.
     */
    public function sendEmailNotification(Order $order, string $status): void
    {
        if (empty($order->customer_email)) {
            return;
        }

        $subject = "Order #{$order->order_number} Status Update: " . strtoupper($status);
        $messageBody = "Hello, your order #{$order->order_number} status has been updated to: " . strtoupper($status) . ". Total: ৳" . number_format($order->grand_total, 2);

        try {
            Mail::raw($messageBody, function ($mail) use ($order, $subject) {
                $mail->to($order->customer_email)
                     ->subject($subject);
            });
            Log::info("Email notification dispatched to {$order->customer_email} for Order #{$order->order_number}");
        } catch (\Throwable $e) {
            Log::warning("Email send error for Order #{$order->order_number}: " . $e->getMessage());
        }
    }

    /**
     * Build customer-friendly SMS message based on status transition.
     */
    private function buildSmsMessage(Order $order, string $status): string
    {
        switch (strtolower($status)) {
            case 'processing':
                return "Dear customer, your Order #{$order->order_number} is now being processed. Total: BDT {$order->grand_total}. Thank you for shopping with us!";
            case 'shipped':
                return "Good news! Your Order #{$order->order_number} has been shipped. Please keep BDT {$order->grand_total} ready for delivery.";
            case 'delivered':
                return "Your Order #{$order->order_number} has been successfully delivered. Thank you for your purchase!";
            case 'cancelled':
                return "Your Order #{$order->order_number} has been cancelled. Please contact support if you need assistance.";
            default:
                return "Your Order #{$order->order_number} status is now: " . strtoupper($status) . ". Thank you!";
        }
    }
}
