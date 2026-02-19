(function () {
    const root = document.getElementById('products-root')

    async function getProducts() {
        const mod = await import('/shared/getProducts.js')
        return mod.fetchProducts()
    }

    function renderProducts(products) {
        if (!root) return

        if (!products.length) {
            root.textContent = 'No products found.'
            return
        }

        const table = document.createElement('table')
        const thead = document.createElement('thead')
        const headerRow = document.createElement('tr')
        ;['id', 'name', 'media', 'price', 'cloudinaryPublicID'].forEach((key) => {
            const th = document.createElement('th')
            th.textContent = key
            headerRow.appendChild(th)
        })
        thead.appendChild(headerRow)
        table.appendChild(thead)

        const tbody = document.createElement('tbody')
        products.forEach((p) => {
            const tr = document.createElement('tr')
            const cells = [p.id, p.name, p.media, p.price, p.cloudinaryPublicID]
            cells.forEach((value) => {
                const td = document.createElement('td')
                td.textContent = value == null ? '' : String(value)
                tr.appendChild(td)
            })
            tbody.appendChild(tr)
        })
        table.appendChild(tbody)

        root.innerHTML = ''
        root.appendChild(table)
    }

    async function renderStock() {
        try {
            const products = await getProducts()
            renderProducts(products)
        } catch (err) {
            if (!root) return
            root.textContent = 'Failed to load products.'
            console.error(err)
        }
    }

    window.renderStock = renderStock

    document.addEventListener('DOMContentLoaded', () => {
        renderStock()
    })

    document.addEventListener('products:refresh', () => {
        renderStock()
    })
})()