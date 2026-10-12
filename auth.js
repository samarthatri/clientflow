
$(document).ready(function () {
    const ACCOUNTS_KEY = "clientflow_accounts";
    const USER_KEY = "clientflow_currentUser";
    const RESET_KEY = "clientflow_resetEmail";

    function getAccounts() {
        try {
            return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveAccounts(accounts) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(USER_KEY));
        } catch {
            return null;
        }
    }

    function showMessage(selector, message, type) {
        $(selector)
            .text(message)
            .removeClass("text-danger text-success")
            .addClass(type === "success" ? "text-success" : "text-danger");
    }

    const page = location.pathname.split("/").pop() || "index.html";
    const publicPages = [
        "login.html",
        "register.html",
        "forgot-password.html",
        "reset-password.html"
    ];

    const currentUser = getCurrentUser();

    if (!publicPages.includes(page) && !currentUser) {
        location.replace("login.html");
        return;
    }

    if (["login.html", "register.html"].includes(page) && currentUser) {
        location.replace("dashboard.html");
        return;
    }

    if (page === "reset-password.html" &&
        !sessionStorage.getItem(RESET_KEY)) {
        location.replace("forgot-password.html");
        return;
    }

    $("#registerForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const name = $("#registerName").val().trim();
        const email = $("#registerEmail").val().trim().toLowerCase();
        const password = $("#registerPassword").val();

        $("#registerError").text("");
        form.classList.add("was-validated");

        if (name.length < 2 || !form.checkValidity()) return;

        const accounts = getAccounts();

        if (accounts.some(account => account.email === email)) {
            $("#registerError").text("An account with this email already exists.");
            return;
        }

        accounts.push({
            name,
            email,
            password,
            role: "User"
        });

        saveAccounts(accounts);
        location.replace("login.html");
    });

    $("#loginForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const email = $("#loginEmail").val().trim().toLowerCase();
        const password = $("#loginPassword").val();

        $("#loginError").text("");
        form.classList.add("was-validated");

        if (!form.checkValidity()) return;

        const account = getAccounts().find(item =>
            item.email === email && item.password === password
        );

        if (!account) {
            $("#loginError").text("Invalid email or password.");
            return;
        }

        localStorage.setItem(USER_KEY, JSON.stringify({
            name: account.name,
            email: account.email,
            role: account.role
        }));

        location.replace("dashboard.html");
    });

    $("#forgotPasswordForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const email = $("#resetEmail").val().trim().toLowerCase();

        $("#resetMessage").text("").removeClass("text-danger text-success");
        form.classList.add("was-validated");

        if (!form.checkValidity()) return;

        const exists = getAccounts().some(account => account.email === email);

        if (!exists) {
            showMessage("#resetMessage", "No account found with this email.", "error");
            return;
        }

        sessionStorage.setItem(RESET_KEY, email);
        location.replace("reset-password.html");
    });

    $("#resetPasswordForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const password = $("#newPassword").val();
        const confirmPassword = $("#confirmPassword").val();
        const email = sessionStorage.getItem(RESET_KEY);

        $("#resetPasswordMessage").text("")
            .removeClass("text-danger text-success");
        form.classList.add("was-validated");

        if (!email) {
            showMessage("#resetPasswordMessage",
                "Please start from the Forgot Password page.", "error");
            return;
        }

        if (!form.checkValidity()) return;

        if (password !== confirmPassword) {
            showMessage("#resetPasswordMessage",
                "Passwords do not match.", "error");
            return;
        }

        const accounts = getAccounts();
        const account = accounts.find(item => item.email === email);

        if (!account) {
            showMessage("#resetPasswordMessage", "Account not found.", "error");
            return;
        }


        account.password = password;
        saveAccounts(accounts);
        sessionStorage.removeItem(RESET_KEY);

        const message = $("#resetPasswordMessage");

        message
            .text("Password updated successfully! Redirecting to login...")
            .removeClass("text-danger")
            .addClass("text-success");

        form.reset();
        form.classList.remove("was-validated");

        form.querySelectorAll(".is-valid, .is-invalid").forEach(function (field) {
            field.classList.remove("is-valid", "is-invalid");
        });

        setTimeout(function () {
            window.location.replace("login.html");
        }, 1500);



        form.reset();

        setTimeout(function () {
            location.replace("login.html");
        }, 1200);
    });

    if ($("#profileForm").length) {
        const user = getCurrentUser();

        if (!user) {
            location.replace("login.html");
            return;
        }

        $("#profileName").val(user.name);
        $("#profileEmail").val(user.email);
        $("#profileRole").val(user.role);

        $("#profileForm").on("submit", function (event) {
            event.preventDefault();

            const form = this;
            const name = $("#profileName").val().trim();
            const email = $("#profileEmail").val().trim().toLowerCase();

            $("#profileMessage").text("")
                .removeClass("text-danger text-success");
            form.classList.add("was-validated");

            if (name.length < 2 || !form.checkValidity()) return;

            const accounts = getAccounts();

            if (accounts.some(account =>
                account.email === email && account.email !== user.email.toLowerCase()
            )) {
                showMessage("#profileMessage",
                    "This email is already used by another account.", "error");
                return;
            }

            const account = accounts.find(item =>
                item.email === user.email.toLowerCase()
            );

            if (!account) {
                showMessage("#profileMessage",
                    "Account not found. Please log in again.", "error");
                return;
            }

            account.name = name;
            account.email = email;
            saveAccounts(accounts);

            const updatedUser = {
                name,
                email,
                role: account.role
            };

            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

            showMessage("#profileMessage",
                "Profile updated successfully!", "success");
        });
    }

    $("#logoutBtn").on("click", function (event) {
        event.preventDefault();
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(RESET_KEY);
        location.replace("login.html");
    });
});




function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (input.type === "password") {
        input.type = "text";
        button.textContent = "🙈";
        button.setAttribute("aria-label", "Hide password");
    } else {
        input.type = "password";
        button.textContent = "👁";
        button.setAttribute("aria-label", "Show password");
    }
}
