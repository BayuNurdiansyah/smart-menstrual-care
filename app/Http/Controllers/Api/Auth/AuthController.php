<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return response()->json([
            'message' => 'Registrasi berhasil. Kode OTP telah dikirim ke email Anda.',
            'user'    => new UserResource($user),
        ], 201);
    }

    /**
     * Login tanpa OTP:
     *  - Admin/Guru  -> email + password
     *  - Murid/Ortu  -> nama + kelas
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (! empty($data['email']) && ! empty($data['password'])) {
            $user = $this->authService->loginByPassword($data['email'], $data['password']);
        } elseif (! empty($data['name']) && ! empty($data['kelas'])) {
            $user = $this->authService->loginByNameClass($data['name'], $data['kelas']);
        } else {
            return response()->json([
                'message' => 'Lengkapi data login (email+password, atau nama+kelas).',
            ], 422);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message'      => 'Berhasil masuk.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ]);
    }

    /**
     * Verifikasi OTP — hanya dipakai saat REGISTER. Setelah valid,
     * email ditandai terverifikasi lalu langsung diterbitkan token (auto-login).
     */
    public function verifyOtp(VerifyOtpRequest $request): JsonResponse
    {
        $user = $this->authService->verifyEmail(
            $request->validated('email'),
            $request->validated('code'),
        );

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message'      => 'Verifikasi berhasil.',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => new UserResource($user),
        ]);
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }
}
