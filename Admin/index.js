const form = document.getElementById('upload-data');

form.addEventListener('submit', async (event) => {
    
    event.preventDefault()

    const formData = new FormData(form);
    
    const res = await fetch("/painting-upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json()
    console.log(data)
})