

const emailEl = document.getElementById("email-el")
emailEl.addEventListener("keydown", async (event) => {
  
 if (event.key !== "Enter") return;

  if (event.key === "Enter") {
    const res = await fetch("/subscribe", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email:emailEl.value })
    })//fetch
    
    emailEl.value = ""
    

  const json = await res.json()
    console.log(json)
     }//if
})

