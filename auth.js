
$(document).ready(function () {
    const getAccounts = function () {
        return JSON.parse(localStorage.getItem("clientflow_accounts")) || [];
    };

    const saveAccounts = function (accounts) {
        localStorage.setItem("clientflow_accounts", JSON.stringify(accounts));
    };

    $("#registerForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const name = $("#registerName").val().trim();
        const email = $("#registerEmail").val().trim().toLowerCase();
        const password = $("#registerPassword").val();

        $("#registerError").text("");
        form.classList.add("was-validated");

        if (name.length < 2 || !form.checkValidity()) {
            return;
        }

        const accounts = getAccounts();

        if (accounts.some(account => account.email === email)) {
            $("#registerError").text("An account with this email already exists.");
            return;
        }

        accounts.push({
            name: name,
            email: email,
            password: password,
            role: "User"
        });

        saveAccounts(accounts);
        window.location.href = "login.html";
    });

    $("#loginForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const email = $("#loginEmail").val().trim().toLowerCase();
        const password = $("#loginPassword").val();

        $("#loginError").text("");
        form.classList.add("was-validated");

        if (!form.checkValidity()) {
            return;
        }

        const accounts = getAccounts();

        const account = accounts.find(function (item) {
            return item.email === email && item.password === password;
        });

        if (!account) {
            $("#loginError").text("Invalid email or password.");
            return;
        }

        localStorage.setItem("clientflow_currentUser", JSON.stringify({
            name: account.name,
            email: account.email,
            role: account.role
        }));

        window.location.href = "index.html";
    });

    
$("#forgotPasswordForm").on("submit", function (event) {
    event.preventDefault();

    const form = this;
    const email = $("#resetEmail").val().trim().toLowerCase();

    $("#resetMessage").text("").removeClass("text-danger text-success");
    form.classList.add("was-validated");

    if (!form.checkValidity()) {
        return;
    }

    const accounts = JSON.parse(
        localStorage.getItem("clientflow_accounts")
    ) || [];

    const accountExists = accounts.some(function (account) {
        return account.email === email;
    });

    if (!accountExists) {
        $("#resetMessage")
            .text("No account found with this email.")
            .addClass("text-danger");
        return;
    }

    sessionStorage.setItem("clientflow_resetEmail", email);
    window.location.href = "reset-password.html";
});

$("#resetPasswordForm").on("submit", function (event) {
    event.preventDefault();

    const form = this;
    const password = $("#newPassword").val();
    const confirmPassword = $("#confirmPassword").val();
    const email = sessionStorage.getItem("clientflow_resetEmail");

    $("#resetPasswordMessage")
        .text("")
        .removeClass("text-danger text-success");

    form.classList.add("was-validated");

    if (!email) {
        $("#resetPasswordMessage")
            .text("Please start from the Forgot Password page.")
            .addClass("text-danger");
        return;
    }

    if (!form.checkValidity()) {
        return;
    }

    if (password !== confirmPassword) {
        $("#resetPasswordMessage")
            .text("Passwords do not match.")
            .addClass("text-danger");
        return;
    }

    const accounts = JSON.parse(
        localStorage.getItem("clientflow_accounts")
    ) || [];

    const account = accounts.find(function (item) {
        return item.email === email;
    });

    if (!account) {
        $("#resetPasswordMessage")
            .text("Account not found.")
            .addClass("text-danger");
        return;
    }

    account.password = password;

    localStorage.setItem(
        "clientflow_accounts",
        JSON.stringify(accounts)
    );

    sessionStorage.removeItem("clientflow_resetEmail");

    $("#resetPasswordMessage")
        .text("Password updated successfully! Redirecting to login...")
        .addClass("text-success");

    form.reset();

    setTimeout(function () {
        window.location.href = "login.html";
    }, 1500);
});

const currentUser = JSON.parse(
    localStorage.getItem("clientflow_currentUser")
);

if ($("#profileForm").length) {
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    $("#profileName").val(currentUser.name);
    $("#profileEmail").val(currentUser.email);
    $("#profileRole").val(currentUser.role);

    $("#profileForm").on("submit", function (event) {
        event.preventDefault();

        const form = this;
        const name = $("#profileName").val().trim();
        const email = $("#profileEmail").val().trim().toLowerCase();

        $("#profileMessage")
            .text("")
            .removeClass("text-danger text-success");

        form.classList.add("was-validated");

        if (name.length < 2 || !form.checkValidity()) {
            return;
        }

        const accounts = JSON.parse(
            localStorage.getItem("clientflow_accounts")
        ) || [];

        const duplicateEmail = accounts.some(function (account) {
            return account.email === email &&
                account.email !== currentUser.email.toLowerCase();
        });

        if (duplicateEmail) {
            $("#profileMessage")
                .text("This email is already used by another account.")
                .addClass("text-danger");
            return;
        }

        const account = accounts.find(function (item) {
            return item.email === currentUser.email;
        });

        if (!account) {
            $("#profileMessage")
                .text("Account not found. Please log in again.")
                .addClass("text-danger");
            return;
        }

        account.name = name;
        account.email = email;

        localStorage.setItem(
            "clientflow_accounts",
            JSON.stringify(accounts)
        );

        const updatedUser = {
            name: name,
            email: email,
            role: currentUser.role
        };

        localStorage.setItem(
            "clientflow_currentUser",
            JSON.stringify(updatedUser)
        );

        $("#profileMessage")
            .text("Profile updated successfully!")
            .addClass("text-success");
    });
}

});
