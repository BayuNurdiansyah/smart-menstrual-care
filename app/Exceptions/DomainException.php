<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Basis exception domain. Mampu me-render dirinya sebagai respons JSON
 * sehingga Controller tetap THIN (tanpa try/catch).
 */
abstract class DomainException extends RuntimeException
{
    /** HTTP status default untuk error domain (Unprocessable Entity). */
    public int $status = 422;

    /** Detik tunggu sebelum boleh mengulang (opsional, untuk rate limit). */
    public ?int $retryAfter = null;

    /** Kode mesin opsional agar frontend bisa membedakan jenis error tanpa parsing pesan. */
    public ?string $errorCode = null;

    public function render($request): JsonResponse
    {
        $payload = ['message' => $this->getMessage()];

        if ($this->errorCode !== null) {
            $payload['error_code'] = $this->errorCode;
        }

        if ($this->retryAfter !== null) {
            $payload['retry_after'] = $this->retryAfter;
        }

        $response = new JsonResponse($payload, $this->status);

        if ($this->retryAfter !== null) {
            $response->headers->set('Retry-After', (string) $this->retryAfter);
        }

        return $response;
    }
}
