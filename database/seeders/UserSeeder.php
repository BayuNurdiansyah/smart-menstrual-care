<?php

namespace Database\Seeders;

use App\Enums\GuardianType;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Bypass OTP: email_verified_at langsung diisi agar akun aktif & terverifikasi.
        $admin = User::updateOrCreate(
            ['email' => 'admin@smartmenstrual.test'],
            [
                'name'              => 'Administrator',
                'password'          => Hash::make('password'),
                'role'              => UserRole::Admin->value,
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        // Murid & Ortu: TANPA password, login pakai Nama + Kelas.
        $murid = User::updateOrCreate(
            ['email' => 'murid@smartmenstrual.test'],
            [
                'name'              => 'Siti Murid',
                'password'          => null,
                'role'              => UserRole::Murid->value,
                'kelas'             => '7A',
                'date_of_birth'     => '2012-05-10',
                'region'            => 'Surakarta, Jawa Tengah',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        $ortu = User::updateOrCreate(
            ['email' => 'ortu@smartmenstrual.test'],
            [
                'name'              => 'Ibu Ani',
                'password'          => null,
                'role'              => UserRole::Ortu->value,
                'kelas'             => '7A',
                'is_active'         => true,
                'email_verified_at' => now(),
            ]
        );

        // Relasi pivot Murid <-> Ortu (idempotent agar aman di-seed ulang).
        $murid->guardians()->syncWithoutDetaching([
            $ortu->id => ['guardian_type' => GuardianType::Ortu->value],
        ]);
    }
}
