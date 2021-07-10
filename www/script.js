document.addEventListener("DOMContentLoaded", init)

let inputHHToken, inputResumeUrl

function init() {
    inputHHToken = document.getElementById("hhtoken")
    inputResumeUrl = document.getElementById("resumeUrl")
    
    document.getElementById("dataForm").addEventListener("submit", submit)
    document.getElementById("resumeUpdate").addEventListener("click", resumeUpdate)
}

function submit(event) {
    event.preventDefault()
    fetch(`./api?hhtoken=${inputHHToken.value}&resumeUrl=${inputResumeUrl.value}`)
        .then(response => response.json())
        .then(data => console.log(data))
}

function resumeUpdate() {
    fetch('./api?updateResume')
        .then(response => response.json())
        .then(data => console.log(data))
}