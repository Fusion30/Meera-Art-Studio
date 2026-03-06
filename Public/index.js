const emailEl = document.getElementById("email-el")
const googleSigninHintEl = document.getElementById("google-signin-hint")
const googleSigninButtonEl = document.querySelector(".g_id_signin")
const googleUserCardEl = document.getElementById("google-user-card")
const googleUserPictureEl = document.getElementById("google-user-picture")
const googleUserNameEl = document.getElementById("google-user-name")
const googleUserEmailEl = document.getElementById("google-user-email")
const googleLogoutButtonEl = document.getElementById("google-logout-button")

function setGoogleHint(message) {
    if (!googleSigninHintEl) return
    googleSigninHintEl.textContent = message
}

// Update the auth section UI based on whether the backend session says a user is logged in.
function renderAuthState(authenticated, user) {
    if (!googleSigninButtonEl || !googleUserCardEl) return

    googleSigninButtonEl.hidden = authenticated
    googleUserCardEl.hidden = !authenticated

    if (!authenticated || !user) {
        if (googleUserPictureEl) {
            googleUserPictureEl.removeAttribute("src")
            googleUserPictureEl.alt = ""
        }
        if (googleUserNameEl) googleUserNameEl.textContent = ""
        if (googleUserEmailEl) googleUserEmailEl.textContent = ""
        setGoogleHint("Sign in with Google to save your account in this app.")
        return
    }

    if (googleUserPictureEl) {
        googleUserPictureEl.src = user.picture || ""
        googleUserPictureEl.alt = `${user.name || user.email || "Google user"} avatar`
    }
    if (googleUserNameEl) googleUserNameEl.textContent = user.name || "Google user"
    if (googleUserEmailEl) googleUserEmailEl.textContent = user.email || ""
    setGoogleHint("You are signed in. This state is being restored from the session.")
}

// Ask the backend whether the browser already has a valid login session.
async function syncCurrentUser() {
    try {
        const res = await fetch("/auth/me", {
            method: "GET",
            credentials: "same-origin"
        })

        if (!res.ok) throw new Error("Failed to load auth state")
        const data = await res.json()
        renderAuthState(Boolean(data.authenticated), data.user)
    } catch (error) {
        console.error("Error loading auth state:", error)
        renderAuthState(false, null)
        setGoogleHint("Could not read current login state. Please refresh and try again.")
    }
}

// Log out from our app by destroying the session and then refresh the auth UI.
async function logoutCurrentUser() {
    try {
        const res = await fetch("/auth/logout", {
            method: "POST",
            credentials: "same-origin"
        })

        if (!res.ok) throw new Error("Failed to log out")

        renderAuthState(false, null)
        setGoogleHint("You have been logged out from this app.")
    } catch (error) {
        console.error("Error logging out:", error)
        setGoogleHint("Logout failed. Please try again.")
    }
}

window.addEventListener("load", () => {
    if (document.getElementById("g_id_onload"))//Is the Google sign-in widget configured on this page?
        setGoogleHint("Google button is managed by Google's HTML API. Session restore runs after page load.")

    syncCurrentUser()
})

// Google popup login finishes outside our page,
// so when focus returns to the page, we re-check `/auth/me`.
// Same with visibilitychange -- if the user switches to another tab 
// during Google login and then comes back, we want to sync the auth state again.
window.addEventListener("focus", () => {
    syncCurrentUser()
})
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        syncCurrentUser()
    }
})

if (googleLogoutButtonEl) googleLogoutButtonEl.addEventListener("click", logoutCurrentUser)

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

