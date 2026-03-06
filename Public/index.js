const emailEl = document.getElementById("email-el")
const googleSigninHintEl = document.getElementById("google-signin-hint")

function setGoogleHint(message) {
    if (!googleSigninHintEl) return
    googleSigninHintEl.textContent = message
}

window.addEventListener("load", () => {
    if (document.getElementById("g_id_onload")) {
        setGoogleHint("Google button is managed by Google's HTML API. Backend verification comes next.")
    }
})



emailEl.addEventListener("keydown", async (event) => {
    
    if (event.key !== "Enter") return;
    if (event.key === "Enter") {
        const res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email:emailEl.value })
        })//fetch        
        emailEl.value = ""
        
        const json = await res.json()
        console.log(json)
    }//if
})

