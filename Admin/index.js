const form = document.getElementById('upload-data');

form.addEventListener('submit', async (event) => {    
    event.preventDefault()
    const formData = new FormData(form);
    try {
        const res = await fetch("/api/painting-upload", {
            method: "POST",
            body: formData
        });
        // Safer parsing: only call res.json() if the response is actually JSON.
        // (Otherwise res.json() can throw, e.g. if the server returns an HTML error page.)
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await res.json()
            : await res.text();
        if (!res.ok) {
            console.error("Upload failed:", res.status, data);
            return;
        }
        document.dispatchEvent(new Event('products:refresh'));
    } catch (err) {
        // Network error, CORS issue, or JSON parse error.
        console.error("Upload request error:", err);
    }
})