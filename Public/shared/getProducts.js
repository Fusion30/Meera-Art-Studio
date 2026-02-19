
// This module exports a single async function `fetchProducts` used by both Admin and Public clients.
export async function fetchProducts() {
    const res = await fetch('/api/products')
    const contentType = res.headers.get('content-type') || ''
    const data = contentType.includes('application/json') ? await res.json() : await res.text()

    if (!res.ok) {
        throw new Error(typeof data === 'string' ? data : (data?.error || 'Failed to fetch products'))
    }

    return Array.isArray(data) ? data : []
}
