// Function to generate random password
function generatePassword() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
  let password = "";
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  document.getElementById('password').value = password;
}

// Function to save password
function savePassword() {
  const password = document.getElementById('password').value;
  
  if (!password) {
    alert("Please generate a password first.");
    return;
  }

  // Send password to server (Node.js backend for storing in data.db)
  fetch('/save-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
  })
  .catch(err => {
    console.error(err);
    alert("Failed to save password.");
  });
}
