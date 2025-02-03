document.getElementById("generateButton").addEventListener("click", generatePassword);
document.getElementById("saveButton").addEventListener("click", savePassword);
document.getElementById("historyButton").addEventListener("click", showHistory);

let generatedPassword = '';

function generatePassword() {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    const passwordLength = 12;
    generatedPassword = '';
    for (let i = 0; i < passwordLength; i++) {
        generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    document.getElementById("passwordDisplay").textContent = generatedPassword;
    document.getElementById("saveButton").disabled = false;
}

function savePassword() {
    let passwords = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    passwords.push(generatedPassword);
    localStorage.setItem("passwordHistory", JSON.stringify(passwords));
    document.getElementById("saveButton").disabled = true;
}

function showHistory() {
    const historyContainer = document.getElementById("historyContainer");
    let passwords = JSON.parse(localStorage.getItem("passwordHistory")) || [];
    historyContainer.innerHTML = "<h3>Password History</h3>";
    if (passwords.length > 0) {
        passwords.forEach((password, index) => {
            historyContainer.innerHTML += `<p>${index + 1}: ${password}</p>`;
        });
    } else {
        historyContainer.innerHTML += "<p>No passwords saved yet.</p>";
    }
}
