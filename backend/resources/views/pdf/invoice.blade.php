<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 13px;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .header {
            display: table;
            width: 100%;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .header-left {
            display: table-cell;
            vertical-align: top;
        }
        .header-right {
            display: table-cell;
            text-align: right;
            vertical-align: top;
        }
        .store-name {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .invoice-title {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            border-radius: 4px;
        }
        .badge-paid { background-color: #dcfce7; color: #166534; }
        .badge-pending { background-color: #fef9c3; color: #854d0e; }
        .details-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .details-table td {
            vertical-align: top;
            width: 50%;
        }
        .box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
        }
        .box-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 6px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background: #f1f5f9;
            color: #475569;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
        }
        .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        .summary-table {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
        }
        .summary-table td {
            padding: 6px 10px;
        }
        .summary-table .total-row td {
            font-size: 15px;
            font-weight: bold;
            color: #4f46e5;
            border-top: 2px solid #e2e8f0;
        }
        .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <!-- Header Section -->
    <div class="header">
        <div class="header-left">
            <div class="store-name">Admin Panel Store</div>
            <div style="color: #64748b; font-size: 11px; mt-1">Official Purchase Invoice</div>
        </div>
        <div class="header-right">
            <div class="invoice-title">INVOICE</div>
            <div style="font-weight: bold; color: #4f46e5;">#{{ $order->order_number }}</div>
            <div style="color: #64748b; font-size: 11px;">Date: {{ $order->created_at->format('M d, Y') }}</div>
            <div style="margin-top: 4px;">
                <span class="badge {{ $order->payment_status === 'paid' ? 'badge-paid' : 'badge-pending' }}">
                    Payment Status: {{ strtoupper($order->payment_status) }}
                </span>
            </div>
        </div>
    </div>

    <!-- Customer & Shipping Details -->
    <table class="details-table">
        <tr>
            <td style="padding-right: 10px;">
                <div class="box">
                    <div class="box-title">Billed / Customer Info</div>
                    <strong>{{ is_array($order->billing_address) ? ($order->billing_address['firstName'] ?? 'Customer') : 'Customer' }}</strong><br>
                    Email: {{ $order->customer_email }}<br>
                    Phone: {{ $order->customer_phone ?? 'N/A' }}
                </div>
            </td>
            <td style="padding-left: 10px;">
                <div class="box">
                    <div class="box-title">Shipping Address</div>
                    @if(is_array($order->shipping_address))
                        {{ $order->shipping_address['address'] ?? 'N/A' }}<br>
                        {{ $order->shipping_address['city'] ?? '' }}
                    @else
                        {{ $order->shipping_address ?? 'N/A' }}
                    @endif
                    <br>
                    Payment Method: <strong>{{ strtoupper($order->payment_method) }}</strong>
                </div>
            </td>
        </tr>
    </table>

    <!-- Itemized Products Table -->
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 45%;">Item Description</th>
                <th style="width: 15%;">SKU</th>
                <th style="width: 15%; text-align: right;">Unit Price</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>
                    <strong>{{ $item->product_name }}</strong>
                </td>
                <td style="color: #64748b; font-size: 11px;">{{ $item->sku ?? 'N/A' }}</td>
                <td style="text-align: right;">৳{{ number_format($item->unit_price, 2) }}</td>
                <td style="text-align: center; font-weight: bold;">{{ $item->quantity }}</td>
                <td style="text-align: right; font-weight: bold;">৳{{ number_format($item->subtotal, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Financial Summary Table -->
    <table class="summary-table">
        <tr>
            <td style="color: #64748b;">Subtotal:</td>
            <td style="text-align: right; font-weight: bold;">৳{{ number_format($order->subtotal, 2) }}</td>
        </tr>
        @if($order->discount_total > 0)
        <tr>
            <td style="color: #16a34a;">Discount:</td>
            <td style="text-align: right; color: #16a34a; font-weight: bold;">-৳{{ number_format($order->discount_total, 2) }}</td>
        </tr>
        @endif
        <tr>
            <td style="color: #64748b;">Shipping Fee:</td>
            <td style="text-align: right;">৳{{ number_format($order->shipping_total, 2) }}</td>
        </tr>
        @if($order->tax_total > 0)
        <tr>
            <td style="color: #64748b;">Tax:</td>
            <td style="text-align: right;">৳{{ number_format($order->tax_total, 2) }}</td>
        </tr>
        @endif
        <tr class="total-row">
            <td>Grand Total:</td>
            <td style="text-align: right;">৳{{ number_format($order->grand_total, 2) }}</td>
        </tr>
    </table>

    <!-- Footer -->
    <div class="footer">
        Thank you for your business! If you have any questions regarding this invoice, please contact support.
    </div>

</body>
</html>
