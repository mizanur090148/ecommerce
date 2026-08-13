<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class CustomerApiController extends Controller
{
    /**
     * Get order history of the authenticated customer.
     */
    public function orders(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::with('items')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('customer_email', strtolower($user->email));
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ]);
    }

    /**
     * Get customer profile and default addresses.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $addresses = CustomerAddress::where('user_id', $user->id)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'addresses' => $addresses,
            ],
        ]);
    }

    /**
     * Update customer profile info (name, email, phone).
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:30',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['phone'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    /**
     * Change customer account password.
     */
    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Save/Update customer address.
     */
    public function saveAddress(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'address_line_1' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'postcode' => 'nullable|string|max:30',
            'phone' => 'nullable|string|max:30',
            'type' => 'nullable|string|in:billing,shipping',
        ]);

        $address = CustomerAddress::updateOrCreate(
            [
                'user_id' => $user->id,
                'type' => $validated['type'] ?? 'billing',
            ],
            [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'address_line_1' => $validated['address_line_1'],
                'city' => $validated['city'],
                'postcode' => $validated['postcode'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'is_default' => true,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Address saved successfully',
            'data' => $address,
        ]);
    }
}
