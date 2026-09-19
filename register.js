const registerForm = document.getElementById("registerForm");
const registerRole = document.getElementById("registerRole");
const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");
const showRegisterPassword = document.getElementById("showRegisterPassword");
const registerMessage = document.getElementById("registerMessage");

showRegisterPassword.addEventListener("click", () => {
    const isPasswordHidden = registerPassword.type === "password";

    registerPassword.type = isPasswordHidden ? "text" : "password";
    confirmPassword.type = isPasswordHidden ? "text" : "password";

    showRegisterPassword.textContent = isPasswordHidden
        ? "Hide Password"
        : "Show Password";
});

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const role = registerRole.value;
    const username = registerUsername.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirmPasswordValue = confirmPassword.value;

    registerMessage.textContent = "";
    registerMessage.style.color = "";

    if (!role || !username || !email || !password || !confirmPasswordValue) {
        registerMessage.textContent = "Please fill in all fields.";
        registerMessage.style.color = "red";
        return;
    }

    if (password.length < 6) {
        registerMessage.textContent = "Password must contain at least 6 characters.";
        registerMessage.style.color = "red";
        return;
    }

    if (password !== confirmPasswordValue) {
        registerMessage.textContent = "Passwords do not match.";
        registerMessage.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:5001/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                role: role,
                username: username,
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            registerMessage.textContent = result.message;
            registerMessage.style.color = "red";
            return;
        }

        registerMessage.textContent = result.message;
        registerMessage.style.color = "green";

        registerForm.reset();

       registerMessage.textContent = "Registration successful. Redirecting...";
registerMessage.style.color = "green";

registerForm.reset();

const loginPage = new URL("index.html", document.baseURI).href;

window.location.assign(loginPage);

    } catch (error) {
        registerMessage.textContent = "Unable to connect to the server.";
        registerMessage.style.color = "red";
    }
});