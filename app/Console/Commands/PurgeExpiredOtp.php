<?php

namespace App\Console\Commands;

use App\Repositories\Contracts\OtpRepositoryInterface;
use Illuminate\Console\Command;

class PurgeExpiredOtp extends Command
{
    protected $signature   = 'otp:purge';
    protected $description = 'Hapus semua OTP yang sudah kedaluwarsa atau dikonsumsi';

    public function handle(OtpRepositoryInterface $otpRepo): int
    {
        $count = $otpRepo->purgeExpired();
        $this->info("Dihapus: {$count} OTP.");
        return self::SUCCESS;
    }
}
