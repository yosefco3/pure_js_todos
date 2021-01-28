const home = document.querySelector(".home")
const signUpFormDiv = document.querySelector(".sign-up-form-div")
const loginFormDiv = document.querySelector(".login-form-div")
const signUpForm = document.querySelector(".sign-up-form")
const loginForm = document.querySelector(".login-form")
const loginError = document.querySelector("#login-error")
const dashboard = document.querySelector(".dashboard")
const todoList = document.querySelector(".todos-container")
const backToLists = document.querySelector(".back-to-lists")
const accountSettings = document.querySelector(".account-settings")
let createListForm = document.querySelector(".create-list-form")
let createTodoForm = document.querySelector(".create-todo-form")
let updateListName = document.querySelector(".update-list-name")
let signUpError = document.querySelector(".error")

let navbar = document.querySelector(".navbar")
let navLinks = document.querySelectorAll(".nav-link")

// navbar initialization
navLinks.forEach(x => x.style.display = "none")

let registratedUser = null
let currentList = null

const signUp = () => {
    home.style.display = "none";
    loginFormDiv.style.display = "none"
    signUpFormDiv.style.display = "block"
}

const login = () => {
    home.style.display = "none";
    signUpFormDiv.style.display = "none"
    loginFormDiv.style.display = "block"
}

function deleteAccount() {
    localStorage.removeItem(registratedUser)
    logout()
}

function updateSettings() {
    signUpFormDiv.style.display = "none"
    loginFormDiv.style.display = "none"
    dashboard.style.display = "none"
    todoList.style.display = "none"
    createListForm.removeEventListener("submit", createListName)
    createTodoForm.removeEventListener("submit", createTodo)
    accountSettings.style.display = "block"
    let user = JSON.parse(localStorage.getItem(registratedUser))
    let email = document.querySelector("#email")
    email.value = user.email
    let firstName = document.querySelector("#updatefirstName")
    let lastName = document.querySelector("#updatelastName")
    let password = document.querySelector('#updatePassword')
    firstName.value = user.firstName
    lastName.value = user.lastName
    password.value = user.password
    let accountForm = document.querySelector(".account-form")
    accountForm.addEventListener("submit", e => {
        e.preventDefault()
            // console.log(e.target.elements)
        const { updatefirstName, updatelastName, updatePassword } = e.target.elements;
        console.log(updatefirstName.value)
        user = {...user, firstName: updatefirstName.value, lastName: updatelastName.value, password: updatePassword.value }
        localStorage.setItem(email.value, JSON.stringify(user))
        accountSettings.style.display = "none"
        showDashboard(user)
    })

}

function logout() {
    // 
    signUpFormDiv.style.display = "none"
    loginFormDiv.style.display = "none"
    dashboard.style.display = "none"
    todoList.style.display = "none"
    accountSettings.style.display = "none"
    createListForm.removeEventListener("submit", createListName)
    createTodoForm.removeEventListener("submit", createTodo)
    navLinks.forEach(x => x.style.display = "none")
        // 
    home.style.display = "block";
    registratedUser = null
    currentList = null
}

function submitSignUp(e) {
    // console.log(e)
    e.preventDefault()
    const { firstName, lastName, inputEmail, inputPassword } = e.target.elements;
    let user = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: inputEmail.value,
        password: inputPassword.value,
        lists: []
    }

    if (localStorage.getItem(user.email) === null) {
        signUpError.style.display = "none"
        localStorage.setItem(user.email, JSON.stringify(user))
        login()
    } else {
        signUpError.style.display = "block"
    }
}

function submitLogin(e) {
    // console.log(e)
    e.preventDefault()
    const { loginEmail, loginPassword } = e.target.elements;
    let userLogin = {
        email: loginEmail.value,
        password: loginPassword.value
    }
    loginUser = checkLogin(loginEmail.value, loginPassword.value)
    if (!loginUser) {
        loginError.style.display = "block"
    } else {
        registratedUser = userLogin.email
        showDashboard(loginUser)
        navbar.style.display = "flex"
        navLinks.forEach(x => x.style.display = "inline")
    }
}

function checkLogin(email, password) {
    for (let key in localStorage) {
        if (email === key && JSON.parse(localStorage.getItem(key)).password === password) {
            // console.log("success")
            loginError.style.display = "none"
            return JSON.parse(localStorage.getItem(key))
        }
    }
    return false
}


function showDashboard(user) {
    dashboard.style.display = "block"
    loginFormDiv.style.display = "none"
    displayLists(user)

    createListForm.addEventListener("submit", createListName)
}

function createListName(e) {
    e.preventDefault()
    let inputListName = document.querySelector("#createTodoList")
    let listName = inputListName.value
    user = JSON.parse(localStorage.getItem(registratedUser))
    number = user.lists.length + 1
    user.lists.push({ listName, number, todos: [] })
    localStorage.setItem(registratedUser, JSON.stringify(user))
    inputListName.value = ""
    displayLists(user)
}

function displayLists(user) {
    let message = document.querySelector(".no-lists-message")
    if (user.lists.length === 0) {
        message.style.display = "block"
    } else {
        message.style.display = "none"
    }
    let lists = []
    listsNames = document.querySelector(".lists-names")
    for (let list of user.lists) {
        lists.push(list)
    }
    lists = lists.map(list => `<div class="list col-12 mt-3">
    <span class="list-name">${list.listName}</span> 
    <div class="list-name-buttons">

    <button class="btn btn-info" onclick=editListName(${list.number})>Edit List Name</button> 
    <button class="btn btn-info" onclick=goToList(${list.number})>Go To List</button>
    <button class="btn btn-info" onclick=deleteList(${list.number})>Delete List</button>
    </div>
    </div>
    </div>`).join("")
    listsNames.innerHTML = lists
}

function goToList(listNumber) {
    let user = JSON.parse(localStorage.getItem(registratedUser))
    let list = user.lists.filter(list => +listNumber === +list.number)[0]
    let listName = document.querySelector(".todolist-name")
    listName.innerHTML = `<h2>List Name: ${list.listName}</h2>`
    dashboard.style.display = "none"
        // because memory leak:
    createListForm.removeEventListener("submit", createListName)
    todoList.style.display = "block"
    displayTodos(list)
        // 
    currentList = listNumber
    createTodoForm.addEventListener("submit", createTodo)
}

function createTodo(e) {
    e.preventDefault()
        // we should do it twice , otherwise it override changes...
    let listNumber = currentList
    let user = JSON.parse(localStorage.getItem(registratedUser))
    let list = user.lists.filter(list => +listNumber === +list.number)[0]
    let inputTodo = document.querySelector("#createTodo")
    let todoText = inputTodo.value
    let number = list.todos.length + 1
    list.todos.push({ todoText, number, done: false })
    user.lists.map(userList => {
        if (+listNumber === +userList.number) {
            userList = list
        }
    })
    localStorage.setItem(registratedUser, JSON.stringify(user))
    inputTodo.value = ""
    displayTodos(list)
}

function displayTodos(list) {
    let message = document.querySelector(".no-todos-message")
    if (list.length === 0) {
        message.style.display = "block"
    } else {
        message.style.display = "none"
    }
    let todoList = document.querySelector(".todo-list")
        // console.log(list)
    let todos = list.todos.map(todo => `<div class="list col-12 mt-4">
    ${todo.done? 
        `<span class="todo-text" style="text-decoration: line-through;color:red;">${todo.todoText}</span>`:
        `<span class="todo-text">${todo.todoText}</span>`
    }
    <div class="todo-buttons">
    ${todo.done ?
        `<button class="btn btn-info" onclick=toggleTodo(${todo.number},${list.number})>Uncheck Todo</button>`:
        `<button class="btn btn-info" onclick=toggleTodo(${todo.number},${list.number})>Check Todo As Done</button>`
    }
    </div>
    </div>
    </div>`).join("")
    todoList.innerHTML = todos
}

function toggleTodo(todoNumber,listNumber){
    let user = JSON.parse(localStorage.getItem(registratedUser))
    user.lists.map(list=>{
            if(list.number===listNumber){
                list.todos.map(todo=>{
                    if (todo.number===todoNumber){
                        todo.done = !todo.done
                    }
                })
            }
    })
    let list = user.lists.filter(x=>x.number===listNumber)[0]
    localStorage.setItem(registratedUser,JSON.stringify(user))
    displayTodos(list)

}

function editListName(listNumber) {
    let user = JSON.parse(localStorage.getItem(registratedUser))
   
    updateListName.style.display = "block"
    updateListName.innerHTML = `<p>update list name:</p>
    <form class="form-inline update-list-name-form">
        <div class="row">
            <div class="form-group mx-sm-3 mb-2 col-5">
                <input type="text" class="form-control" id="updateTodoListName" required>
            </div>
                <button type="submit" class="btn btn-warning mb-2 col-3">Update Todo List Name</button>
        </div>
    </form>`
    let updateListNameForm = document.querySelector(".update-list-name-form")
    updateListNameForm.addEventListener("submit", e => {
        e.preventDefault()
        updatedName = document.querySelector("#updateTodoListName").value
        user.lists.map(list => {
            if (+list.number === +listNumber) {
                list.listName = updatedName
            }
        })
        localStorage.setItem(user.email, JSON.stringify(user))
        displayLists(user)
        updateListName.style.display = "none"
    })
}

function deleteList(listNumber) {
    let user = JSON.parse(localStorage.getItem(registratedUser))
    user.lists = user.lists.filter(list => +list.number !== +listNumber)
    localStorage.setItem(user.email, JSON.stringify(user))
    displayLists(user)
}

function returnToDeshboard(){
    todoList.style.display="none"
    let user = JSON.parse(localStorage.getItem(registratedUser))
    // other wise it would firing double times
    createTodoForm.removeEventListener("submit", createTodo)
    showDashboard(user)
}

signUpForm.addEventListener("submit", submitSignUp)
loginForm.addEventListener("submit", submitLogin)
backToLists.addEventListener("click",returnToDeshboard)