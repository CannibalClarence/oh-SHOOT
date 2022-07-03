// Get the modal
var loginModal = document.getElementById("loginModal");

// Get the button that opens the modal
var modalOpen = document.getElementById("login");

// Get the <span> element that closes the modal
var modalClose = document.getElementById("close");

// When the user clicks on the button, open the modal
modalOpen
    .addEventListener("click", function () {
        loginModal
            .setAttribute("style", "display: block")
    });


// When the user clicks on <span> (x), the modal closes
if (document.getElementById("close")) {
    document
        .getElementById("close")
        .addEventListener("click", function () {
            loginModal
                .setAttribute("style", "display: none")
        });
};

// When the user clicks anywhere outside of the modal, it closes
window.addEventListener("click", function (event) {
    if (event.target == loginModal) {
        loginModal
            .setAttribute("style", "display: none");
    };
});



if (document.getElementById("signUpDiv")) {
    document
        .getElementById("signUpDiv")
        .addEventListener("click", function () {
            document
                .getElementById("signUpForm")
                .setAttribute("style", "display: flex");
            document
                .getElementById("signupBtn")
                .setAttribute("style", "display: flex");
            document
                .getElementById("signInForm")
                .setAttribute("style", "display: none");
                document
                .getElementById("loginBtn")
                .setAttribute("style", "display: none");
        });
};



if (document.getElementById("signInDiv")) {
    document
        .getElementById("signInDiv")
        .addEventListener("click", function () {
            document
                .getElementById("signInForm")
                .setAttribute("style", "display: flex");
            document
                .getElementById("loginBtn")
                .setAttribute("style", "display: flex");
            document
                .getElementById("signUpForm")
                .setAttribute("style", "display: none");
                document
                .getElementById("signupBtn")
                .setAttribute("style", "display: none");
        });
};


async function loginForm(event) {
    event.preventDefault();
    //inputs for login
    const username = document.querySelector("#email-login").value.trim();
    const password = document.querySelector("#password-login").value.trim();

    // these must have content
    if (username && password) {
        //fetch 
        const response = await fetch("/api/users/", {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            alert("GREAT SUCCESS!")
            console.log("GREAT SUCCESS!");
            console.log(JSON.stringify(username))
           

            document.querySelector("#email-login").value = ""
            document.querySelector("#password-login").value = ""


            document.location.replace("/");
        } else {
            alert(response.statusText);
        }
    }
}


async function signupForm(event) {
    event.preventDefault();

    const username = document.getElementById("#username-signup");
    const userVal = "";
    if (username) {
        userVal = username.value.trim;
    }

    const email = document.getElementById("#email-signup");
    const emailVal = "";
    if (email) {
        emailVal = email.value.trim;
    }

    const password = document.getElementById("#password-signup");
    const passwordVal = "";
    if (password) {
        passwordlVal = password.value.trim;
    }

    if (username && email && password) {
        const response = await fetch("/api/users/create", {
            method: "POST",
            body: JSON.stringify({
                username,
                email,
                password,
            }),
            headers: { "Content-Type": "application/json" },
        });
        console.log(username, email, password);

        if (response.ok) {
            console.log(response);
        } else {
            alert(response.statusText);
        }
    }
    // login / signup same time
    const responseTwo = await fetch("/api/users/", {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
        }),
        headers: { "Content-Type": "application/json" },
    });

    if (responseTwo.ok) {
        alert("Have at it, you murderous space cow!");
        document.querySelector("#username-signup").value = ""
        document.querySelector("#email-signup").value = ""
        document.querySelector("#password-signup").value = ""
        console.log(responseTwo);

    } else {
        //alert sending response from login attempt
        alert(responseTwo.statusText);
    }
}


document.querySelector("#loginBtn").addEventListener("click", loginForm);

document.querySelector("#signupBtn").addEventListener("click", signupForm);