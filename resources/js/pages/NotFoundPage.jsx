import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-5xl font-bold text-primary-500">404</h1>
            <p className="text-gray-500">Halaman tidak ditemukan.</p>
            <Link to="/" className="text-primary-500 underline hover:text-primary-700">
                Kembali ke beranda
            </Link>
        </div>
    )
}
