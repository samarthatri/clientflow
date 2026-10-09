
$(document).ready(function () {
  let users = JSON.parse(localStorage.getItem("clientflow_users")) || [
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@example.com",
      role: "Admin"
    },
    {
      id: 2,
      name: "Priya Verma",
      email: "priya@example.com",
      role: "Agent"
    },
    {
      id: 3,
      name: "Aman Gupta",
      email: "aman@example.com",
      role: "User"
    }
  ];


  function saveUsers() {
    localStorage.setItem("clientflow_users", JSON.stringify(users));
  }


  function displayUsers() {
    const tableBody = $("#userTableBody");
    tableBody.empty();

    users.forEach(function (user) {
      const row = $("<tr>");

      $("<td>").text(user.id).appendTo(row);
      $("<td>").text(user.name).appendTo(row);
      $("<td>").text(user.email).appendTo(row);
      $("<td>").text(user.role).appendTo(row);

      const actions = $("<td>");

      $("<button>")
        .addClass("btn btn-sm btn-warning me-2 edit-user")
        .text("Edit")
        .attr("data-id", user.id)
        .appendTo(actions);

      $("<button>")
        .addClass("btn btn-sm btn-danger delete-user")
        .attr("data-id", user.id)
        .text("Delete")
        .appendTo(actions);

      actions.appendTo(row);
      tableBody.append(row);
    });

    $("#totalUsers").text(users.length);

    $("#totalAgents").text(
      users.filter(function (user) {
        return user.role === "Agent";
      }).length
    );

    $("#totalAdmins").text(
      users.filter(function (user) {
        return user.role === "Admin";
      }).length
    );
  }

  displayUsers();

  $("#testButton").on("click", function () {
    $("#message")
      .text("Great! JavaScript and jQuery are working.")
      .css("color", "green");
  });

  $("#addUserBtn").on("click", function () {
    const form = $("#addUserForm")[0];

    form.reset();
    form.classList.remove("was-validated");

    $("#userName")[0].setCustomValidity("");
    $("#formError").text("");

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("addUserModal")
    ).show();
  });

  $("#userName").on("input", function () {
    this.setCustomValidity("");

    if (this.value.trim().length < 2) {
      this.setCustomValidity(
        "Name must contain at least 2 characters."
      );
    }
  });

  $("#addUserForm").on("submit", function (event) {
    event.preventDefault();

    const form = this;
    const name = $("#userName").val().trim();
    const email = $("#userEmail").val().trim();
    const role = $("#userRole").val();

    $("#formError").text("");
    form.classList.add("was-validated");

    if (name.length < 2 || !form.checkValidity()) {
      return;
    }

    const emailExists = users.some(function (user) {
      return user.email.toLowerCase() === email.toLowerCase();
    });

    if (emailExists) {
      $("#formError").text(
        "This email is already registered."
      );
      return;
    }

    const newId = users.length
      ? Math.max(...users.map(function (user) {
        return user.id;
      })) + 1
      : 1;


    users.push({
      id: newId,
      name: name,
      email: email,
      role: role
    });

    saveUsers();
    displayUsers();

    $("#searchUser").val("");

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addUserModal")
    );

    if (modal) {
      modal.hide();
    }

    form.reset();
    form.classList.remove("was-validated");

    $("#message")
      .text("User created successfully!")
      .css("color", "green");
  });

  $("#userTableBody").on("click", ".delete-user", function () {
    const userId = Number($(this).attr("data-id"));

    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    const userExists = users.some(function (user) {
      return Number(user.id) === userId;
    });

    if (!userExists) {
      console.error("User not found. ID:", userId);
      return;
    }


    users = users.filter(function (user) {
      return Number(user.id) !== userId;
    });

    saveUsers();
    $("#searchUser").val("");
    displayUsers();


    $("#message")
      .text("User deleted successfully!")
      .css("color", "green");

    console.log("Remaining users:", users);
  });

  $("#searchUser").on("input", function () {
    const searchTerm = $(this).val().trim().toLowerCase();

    $("#userTableBody tr").each(function () {
      const rowText = $(this).text().toLowerCase();
      $(this).toggle(rowText.includes(searchTerm));
    });
  });



  $("#userTableBody").on("click", ".edit-user", function () {
    const userId = Number($(this).attr("data-id"));

    const user = users.find(function (item) {
      return item.id === userId;
    });

    if (!user) return;

    $("#editUserId").val(user.id);
    $("#editUserName").val(user.name);
    $("#editUserEmail").val(user.email);
    $("#editUserRole").val(user.role);
    $("#editFormError").text("");
    $("#editUserForm").removeClass("was-validated");

    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("editUserModal")
    ).show();
  });

  $("#editUserForm").on("submit", function (event) {
    event.preventDefault();

    const form = this;
    const userId = Number($("#editUserId").val());
    const name = $("#editUserName").val().trim();
    const email = $("#editUserEmail").val().trim();
    const role = $("#editUserRole").val();

    $("#editFormError").text("");
    form.classList.add("was-validated");

    if (name.length < 2 || !form.checkValidity()) {
      return;
    }

    const emailExists = users.some(function (user) {
      return user.id !== userId &&
        user.email.toLowerCase() === email.toLowerCase();
    });

    if (emailExists) {
      $("#editFormError").text(
        "This email is already used by another user."
      );
      return;
    }

    const user = users.find(function (item) {
      return item.id === userId;
    });

    if (!user) return;


    user.name = name;
    user.email = email;
    user.role = role;

    saveUsers();
    displayUsers();
    $("#searchUser").val("");


    bootstrap.Modal.getInstance(
      document.getElementById("editUserModal")
    ).hide();

    $("#message")
      .text("User updated successfully!")
      .css("color", "green");
  });

});
