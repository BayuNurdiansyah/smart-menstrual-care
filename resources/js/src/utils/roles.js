// Peta role -> halaman utama setelah login.
export function roleHome(role) {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'ortu':
        case 'guru':
            return '/guardian';
        case 'murid':
            return '/murid';
        default:
            return '/login';
    }
}
