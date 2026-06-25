<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Batasi akses berdasarkan role. Pemakaian: ->middleware('role:murid')
     * atau beberapa role ->middleware('role:ortu,guru').
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null || ! in_array($user->role, $roles, true)) {
            abort(403, 'Anda tidak memiliki akses ke sumber daya ini.');
        }

        return $next($request);
    }
}
